// Get sass.js from node_modules, but sass.worker.js from public folder 
import Sass, { SassWorker } from 'sass.js/dist/sass';
import { combineEpics } from 'redux-observable';

import { KeyedLookup, testNever, mapValues } from '@model/generic.model';
import { Message } from '@model/worker.model';
import { createAct, ActionsUnion, Redacted, redact, addToLookup, removeFromLookup, updateLookup, ReduxUpdater, createThunk } from '@model/store/redux.model';
import { IMonacoTextModel, Editor, TypescriptDefaults, Typescript, Monaco, Uri, IMarkerData, ScssTranspilationResult, filenameToModelKey } from '@model/monaco/monaco.model';
import { MonacoService } from '@model/monaco/monaco.service';
import { accessibilityHelpUrl } from '@model/monaco/monaco.model';
import { SyntaxWorker, awaitWorker, MessageFromWorker } from '@worker/syntax/worker.model';
import SyntaxWorkerClass from '@worker/syntax/syntax.worker';
import { Classification } from '@worker/syntax/highlight.model';
import { CODE_FONT_FAMILY } from '@components/monaco/editor.model';
import { TranspiledCodeFile } from '@model/dev-env/dev-env.model';


export interface State {
  /** Instances of monaco editor */
  editor: KeyedLookup<EditorInstance>;
  globalTypesLoaded: boolean;
  /** Internal monaco structures */
  internal: null | MonacoInternal;
  /** Instances of monaco models */
  model: KeyedLookup<ModelInstance>;
  monacoLoaded: boolean;
  monacoLoading: boolean;
  monacoService: null | Redacted<MonacoService>;
  sassWorker: null | Redacted<SassWorker>;
  syntaxWorker: null | Redacted<SyntaxWorker>;
}

interface EditorInstance {
  key: string;
  editor: Redacted<Editor>;
  lastDecorations: string[];
  cleanups: (() => void)[];
}
interface ModelInstance {
  key: string;
  model: Redacted<IMonacoTextModel>;
  filename: string;
  uri: Redacted<Uri>;
}
interface MonacoInternal {
  typescriptDefaults: Redacted<TypescriptDefaults>;
  typescript: Redacted<Typescript>;
  monaco: Redacted<Monaco>;
}

const initialState: State = {
  editor: {},
  internal: null,
  monacoLoading: false,
  monacoLoaded: false,
  model: {},
  monacoService: null,
  globalTypesLoaded: false,
  sassWorker: null,
  syntaxWorker: null,
};

export const Act = {
  addEditorCleanups: (input: { editorKey: string; cleanups: (() => void)[] }) =>
    createAct('[editor] add editor cleanups', input),
  storeMonacoEditor: (input: { editorKey: string; editor: Redacted<Editor> }) =>
    createAct('[editor] store monaco editor', input),
  setMonacoInternal: (monacoInternal: MonacoInternal) =>
    createAct('[editor] store monaco core', { monacoInternal }),
  setMonacoService: (service: Redacted<MonacoService>) =>
    createAct('[editor] store monaco service', { service }),
  setMonacoLoaded: (loaded: boolean) =>
    createAct('[editor] set monaco loaded', { loaded }),
  setGlobalTypesLoaded: (loaded: boolean) =>
    createAct('[editor] set global types loaded', { loaded }),
  setMonacoLoading: (loading: boolean) =>
    createAct('[editor] set monaco loading', { loading }),
  storeMonacoModel: (input: {
    modelKey: string;
    model: Redacted<IMonacoTextModel>;
    filename: string;
    uri: Redacted<Uri>;
  }) =>
    createAct('[editor] store monaco model', input),
  storeSassWorker: ({ worker }: { worker: Redacted<SassWorker> }) =>
    createAct('[editor] store sass', { worker }),
  storeSyntaxWorker: ({ worker }: { worker: Redacted<SyntaxWorker> }) =>
    createAct('[editor] store syntax', { worker }),
  update: (updates: Partial<State>) =>
    createAct('[editor] update', { updates }),
  updateEditor: (editorKey: string, updates: ReduxUpdater<EditorInstance>) =>
    createAct('[editor] update editor', { editorKey, updates }),
};

export type Action = ActionsUnion<typeof Act>;

export const Thunk = {
  addTypings: createThunk(
    '[editor] add typings',
    ({ state: { editor } }, { filename, typings }: { filename: string; typings: string }) => {
      return editor.internal!.typescriptDefaults.addExtraLib(typings, filename);
    },
  ),
  bootstrapEditor: createThunk(
    '[editor] bootstrap editor',
    async (
      { state: { editor }, dispatch, getState },
      input: MonacoInternal & {
        editorKey: string;
        modelKey: string;
        div: HTMLDivElement;
        filename: string;
        code: string;
      },
    ) => {
      if (editor.monacoLoading) {// Wait for 1st load
        return false;
      } else if (!editor.monacoLoaded) {// Commence 1st load
        dispatch(Act.setMonacoLoading(true));
      }

      if (!editor.internal) {
        await dispatch(Thunk.bootstrapMonaco({
          typescript: redact(input.typescript),
          typescriptDefaults: redact(input.typescriptDefaults),
          monaco: redact(input.monaco),
        }));
      }

      if (!editor.syntaxWorker) {
        const syntaxWorker = new SyntaxWorkerClass;
        dispatch(Act.storeSyntaxWorker({ worker: redact(syntaxWorker) }));
        syntaxWorker.postMessage({ key: 'request-status' });
        // await awaitWorker('worker-ready', syntaxWorker);
        // await dispatch(Thunk.loadGlobalTypes({}));
        dispatch(Thunk.loadGlobalTypes({}));
      }

      const monacoModel = dispatch(Thunk.ensureMonacoModel({
        filename: input.filename,
        code: input.code,
      }));
      const monacoEditor = input.monaco.editor.create(input.div, {
        fontFamily: CODE_FONT_FAMILY,
        fontSize: 11,
        model: monacoModel,
        accessibilityHelpUrl,
      });
      await dispatch(Thunk.createMonacoEditor({
        editorKey: input.editorKey,
        editor: redact(monacoEditor),
        modelKey: input.modelKey,
        model: redact(monacoModel),
        filename: input.filename,
      }));

      if (getState().editor.monacoLoading) {
        dispatch(Act.setMonacoLoading(false));
        dispatch(Act.setMonacoLoaded(true));
      }

      return true;
    },
  ),
  bootstrapMonaco: createThunk(
    '[editor] bootstrap monaco',
    async ({ dispatch }, monacoInternal: MonacoInternal) => {
      // Dynamic import keeps monaco out of main bundle
      const { MonacoService } = await import('@model/monaco/monaco.service');
  
      dispatch(Act.setMonacoService(redact(new MonacoService)));
      dispatch(Act.setMonacoInternal(monacoInternal));
      dispatch(Thunk.setMonacoCompilerOptions({}));
      monacoInternal.typescriptDefaults.setEagerModelSync(true);
      monacoInternal.monaco.editor.setTheme('vs-dark');

      Sass.setWorkerUrl('/sass.worker.js');
      const sassWorker = new Sass;
      dispatch(Act.storeSassWorker({ worker: redact(sassWorker) }));
    },
  ),
  changeEditorModel: createThunk(
    '[editor] change editor model',
    ({ dispatch, state: { editor: e } }, { editorKey, nextFilename }: {
      editorKey: string;
      nextFilename: string;
    }) => {
      dispatch(Thunk.cleanupEditor({ editorKey }));
      const model = dispatch(Thunk.ensureMonacoModel({ filename: nextFilename, code: '' }));
      const editor = e.editor[editorKey].editor;
      editor.setModel(model);
      if (nextFilename.endsWith('.tsx')) {
        dispatch(Thunk.setupTsxCommentToggling({ editor, editorKey }));
        dispatch(Thunk.setupTsxHighlighting({ editorKey }));        
      }
    },
  ),
  cleanupEditor: createThunk(
    '[editor] cleanup editor',
    ({ state: { editor } }, { editorKey }: { editorKey: string }) => {
      editor.editor[editorKey]?.cleanups.forEach(cleanup => cleanup());
    },
  ),
  computeJsImportExports: createThunk(
    '[editor] compute js import/export meta',
    async ({ state: { editor, devEnv } }, { filename, code }: { filename: string; code: string }) => {
      const { transpiled } = devEnv.file[filename] as TranspiledCodeFile;
      if (transpiled?.src === code) {// Avoid recomputation
        return { imports: transpiled.imports, exports: transpiled.exports, jsErrors: transpiled.jsPathErrors };
      }
      const worker = editor.syntaxWorker!;
      worker.postMessage({ key: 'request-import-exports', code, filename, as: 'js', filenames: mapValues(devEnv.file, () => true) });
      return await awaitWorker('send-import-exports', worker, ({ origCode }) => code === origCode);
    },
  ),
  computeTsImportExports: createThunk(
    '[editor] compute ts import/export meta',
    async ({ state: { editor, devEnv } }, { filename }: { filename: string }) => {
      const worker = editor.syntaxWorker!;
      const code = editor.model[filenameToModelKey(filename)].model.getValue();
      worker.postMessage({ key: 'request-import-exports', code, filename, as: 'src', filenames: mapValues(devEnv.file, () => true) });
      return await awaitWorker('send-import-exports', worker, ({ origCode }) => code === origCode);
    },
  ),
  createMonacoEditor: createThunk(
    '[editor] create monaco editor',
    async ({ dispatch, state: { editor: e } }, { editor, editorKey, model, modelKey, filename }: {
      editor: Redacted<Editor>;
      editorKey: string;
      modelKey: string;
      model: Redacted<IMonacoTextModel>;
      filename: string;
    }) => {
      dispatch(Act.storeMonacoEditor({ editorKey, editor }));

      if (!e.model[modelKey]) {
        dispatch(Act.storeMonacoModel({
          modelKey,
          model,
          filename,
          uri: redact(e.internal!.monaco.Uri.parse(`file:///${filename}`)),
        }));
      }
      model.updateOptions({ tabSize: 2, indentSize: 2, trimAutoWhitespace: true });

      if (filename.endsWith('.tsx')) {
        dispatch(Thunk.setupTsxCommentToggling({ editor, editorKey }));
        dispatch(Thunk.setupTsxHighlighting({ editorKey }));
      }
    },
  ),
  ensureMonacoModel: createThunk(
    '[editor] ensure monaco model',
    ({ state: { editor }, dispatch }, { filename, code }: { filename: string; code: string }) => {
      const { internal, model: m } = editor;
      const { monaco } = internal!;

      const uri = monaco.Uri.parse(`file:///${filename}`);
      const model = monaco.editor.getModel(uri) || monaco.editor.createModel(code, undefined, uri);
      
      // Don't track special model which ensures monaco is bootstrapped
      if (filename === '__bootstrap.ts') {
        return model;
      }

      // Ensure model is stored in the state
      const modelKey = filenameToModelKey(filename);
      if (!(modelKey in m)) {
        dispatch(Act.storeMonacoModel({
          modelKey,
          model: redact(model),
          filename,
          uri: redact(uri),
        }));
      }
      return model;
    },
  ),
  getModelMarkers: createThunk(
    '[editor] get model markers',
    ({ state: { editor: e } }, { modelKey }: { modelKey: string }) => {
      const { model } = e.model[modelKey];
      return e.internal!.monaco.editor.getModelMarkers({ resource: model.uri });
    },
  ),
  /** Load types associated to globals */
  loadGlobalTypes: createThunk(
    '[editor] ensure monaco types',
    async ({ state: { editor: worker }, dispatch }) => {
      const { typescriptDefaults } = worker.internal!;
      dispatch(Thunk.setTsDiagnostics({ mode: 'off' }));
      await worker.monacoService!.loadGlobalTypes(typescriptDefaults);
      dispatch(Thunk.setTsDiagnostics({ mode: 'on' }));
      dispatch(Act.setGlobalTypesLoaded(true));
    },
  ),
  highlightTsxSyntax: createThunk(
    '[editor] highlight tsx syntax',
    ({ state: { editor: e } }, { editorKey }: { editorKey: string }) => {
      const { editor } = e.editor[editorKey];
      e.syntaxWorker!.postMessage({
        key: 'request-tsx-highlights',
        editorKey,
        code: editor.getValue(),
      });
    },
  ),
  removeMonacoEditor: createThunk(
    '[editor] remove monaco editor',
    ({ dispatch, state: { editor: { editor } }}, { editorKey }: { editorKey: string }) => {
      // editor might not have loaded before dismount
      if (editor[editorKey]) {
        dispatch(Thunk.cleanupEditor({ editorKey }));
        editor[editorKey].editor.dispose();
        dispatch(Act.update({ editor: removeFromLookup(editorKey, editor) }));
      }
    },
  ),
  removeMonacoModel: createThunk(
    '[editor] remove monaco model',
    ({ dispatch, state: { editor: { model } }
    }, { modelKey }: { modelKey: string }) => {
      model[modelKey]?.model.dispose();
      dispatch(Act.update({ model: removeFromLookup(modelKey, model) }));
    },
  ),
  resizeEditor: createThunk(
    '[editor] resize editor',
    ({ state: { editor: worker } }, { editorKey }: { editorKey: string }) => {
      worker.editor[editorKey].editor.layout();
    },
  ),
  setModelMarkers: createThunk(
    '[editor] set model markers',
    ({ state: { editor: e } }, { modelKey, markers }: { modelKey: string; markers: IMarkerData[] }) => {
      const { model } = e.model[modelKey];
      // const modelMarkers = e.internal!.monaco.editor.getModelMarkers({ resource: uri });
      // console.log({ modelKey, model, markers });
      e.internal!.monaco.editor.setModelMarkers(model, 'custom-owner', markers);
    },
  ),
  setMonacoCompilerOptions: createThunk(
    '[editor] set monaco compiler options',
    ({ state: { editor: { internal: monacoInternal } } }) => {
      const { typescriptDefaults, typescript } = monacoInternal!;
      const oldCompilerOptions = typescriptDefaults.getCompilerOptions();
      typescriptDefaults.setCompilerOptions({
        experimentalDecorators: true,
        preserveConstEnums: true,
        noImplicitThis: true,
        allowNonTsExtensions: true,
        target: typescript.ScriptTarget.ES2015,
        jsx: typescript.JsxEmit.React,
        module: typescript.ModuleKind.ESNext,
        baseUrl: 'file:///',
        paths: {
          // This is updated after types are loaded, so preserve the old setting
          ...oldCompilerOptions.paths,
          // Our own notion of package/module
          '@package/*': ['package/*'],
        },
        declaration: true, // Generate d.ts content in `emitOutput.outputFiles[1]`
      });
    },
  ),
  setupTsxHighlighting: createThunk(
    '[editor] setup tsx highlighting',
    ({ state: { editor: e }, dispatch }, { editorKey }: { editorKey: string }) => {
      const eventListener = ({ data }: Message<MessageFromWorker>) => {
        if (data.key === 'send-tsx-highlights' && data.editorKey === editorKey) {
          requestAnimationFrame(() =>
            dispatch(Thunk.updateEditorDecorations({ editorKey, classifications: data.classifications })));
        }
      };
      e.syntaxWorker!.addEventListener('message', eventListener);
      const syntaxHighlight = () => dispatch(Thunk.highlightTsxSyntax({ editorKey }));
      const disposable = dispatch(Thunk.trackModelChange({ editorKey, delayMs: 300, delayType: 'throttle', do: syntaxHighlight }));

      dispatch(Act.addEditorCleanups({ editorKey, cleanups: [
        () => e.syntaxWorker?.removeEventListener('message', eventListener),
        () => disposable.dispose(),
      ]}));
    },
  ),
  setTsDiagnostics: createThunk(
    '[editor] set ts diagnostics',
    ({ state: { editor } }, { mode }: { mode: 'on' | 'off' }) => {
      editor.internal!.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: mode === 'off',
        noSyntaxValidation: mode === 'off',
      });
    },
  ),
  /**
   * Execute a debounced or throttled action whenever editor model changes.
   */
  trackModelChange: createThunk(
    '[editor] on model change',
    ({ state: { editor: { model: m, editor: e } } }, arg: {
      do: (newValue: string) => void;
      delayMs: number;
      delayType: 'debounce' | 'throttle';
    } & ({ modelKey: string } | { editorKey: string })) => {
      let [debounceId, running] = [0, false];
      const model = 'modelKey' in arg ? m[arg.modelKey].model : e[arg.editorKey].editor.getModel()!;
      return model.onDidChangeContent((_event) => {
        if (arg.delayType === 'throttle' && running) return;
        window.clearTimeout(debounceId);
        running = true;
        debounceId = window.setTimeout(() => {
          arg.do(model.getValue());
          running = false;
        }, arg.delayMs);
      });
    },
  ),
  transpileScss: createThunk(
    '[editor] transpile scss',
    async (
      { state: { editor } },
      { src, files }: { src: string; files: { filename: string; contents: string }[] },
    ): Promise<ScssTranspilationResult> => {
      // console.log({ files });
      /**
       * TODO normalise module specifiers e.g.
       * ./other.scss to package/shared/other.scss
       */
      files.forEach(({ contents, filename }) =>
        editor.sassWorker!.writeFile(filename, contents));

      return new Promise((resolve, _reject) => {
        editor.sassWorker!.compile(src, (result) => {
          console.log({ sassWorkerResult: result });
          resolve('text' in result
            ? { key: 'success', src, dst: result.text }
            : { key: 'error', errorKey: 'sass.js', error: result }
          );
        });
      });
    }
  ),
  transpileTsMonacoModel: createThunk(
    '[editor] transpile ts monaco model',
    ({ state: { editor: e } }, { modelKey }: { modelKey: string }) =>
      e.monacoService!.transpileTsModel(e.model[modelKey].model)
  ),
  setupTsxCommentToggling: createThunk(
    '[editor] setup tsx comment toggling',
    ({ state: { editor: { internal, syntaxWorker } }, dispatch }, { editor, editorKey }: {
      editor: EditorInstance['editor'];
      editorKey: string;
    }) => {
      const { monaco } = internal!;
      const disposable = editor.addAction({
        id: 'editor.action.commentLine-tsx',
        label: 'Custom Toggle Line Comment for Tsx',
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.US_SLASH],
        run: async (editor) => { 
          const model = editor.getModel()!;
          const { startLineNumber, endLineNumber } = editor.getSelection()!;
          const startLineStartPos = model.getOffsetAt({ lineNumber: startLineNumber, column: 0 });
          const endLineEndCol = model.getLineMaxColumn(endLineNumber);
          let endLineEndPos = model.getOffsetAt({ lineNumber: endLineNumber, column: 0 }) + endLineEndCol - 1;
          if (model.getValue().substr(endLineEndPos, 1) === '\n') endLineEndPos--;
          const code = editor.getValue() || '';
          
          syntaxWorker!.postMessage({
            key: 'request-toggled-tsx-comment',
            code,
            startLineStartPos,
            endLineEndPos,
          });        
          const { result } = await awaitWorker('send-tsx-commented', syntaxWorker!, ({ origCode }) => code === origCode);

          if (result.key === 'jsx-comment') {
            editor.executeEdits('tsx-comment-edit', [{
              range: new monaco.Range(startLineNumber, 0, endLineNumber, endLineEndCol),
              text: result.nextSelection,
              forceMoveMarkers: true,
            }]);
            editor.setSelection(new monaco.Selection(startLineNumber, 0, endLineNumber, model.getLineMaxColumn(endLineNumber)));
          } else {
            await editor.getAction('editor.action.commentLine').run();
          }
          dispatch(Thunk.highlightTsxSyntax({ editorKey }));
        },
      });
      dispatch(Act.addEditorCleanups({ editorKey, cleanups: [() => disposable.dispose()] }));
    },
  ),
  updateEditorDecorations: createThunk(
    '[editor] update editor decorations',
    ({ state: { editor: worker }, dispatch }, { editorKey, classifications }: {
      editorKey: string;
      classifications: Classification[];
    }) => {
      const { lastDecorations, editor } = worker.editor[editorKey];
      
      const decorations = classifications.map(classification => {
        return {
          range: new worker.internal!.monaco.Range(
            classification.startLineNumber,
            classification.startColumn,
            classification.endLineNumber,
            classification.endColumn,
          ),
          options: {
            inlineClassName: classification.kind,
          },
        };
      });
      const nextDecorations = editor.deltaDecorations(lastDecorations, decorations);
      dispatch(Act.updateEditor(editorKey, () => ({ lastDecorations: nextDecorations })));
    },
  ),
  useMonacoModel: createThunk(
    '[editor] use monaco model',
    ({ dispatch, state: { editor: { editor, internal } } }, { editorKey, model, modelKey, filename }: {
      editorKey: string;
      modelKey: string;
      model: Redacted<IMonacoTextModel>;
      filename: string;
    }) => {
      if (editor[editorKey]) {
        const uri = redact(internal!.monaco.Uri.parse(`file:///${filename}`));
        dispatch(Act.storeMonacoModel({ modelKey, model: redact(model), filename, uri }));
        editor[editorKey].editor.setModel(model);
      }
    },
  ),
};

export type Thunk = ActionsUnion<typeof Thunk>;

export const reducer = (state = initialState, act: Action): State => {
  switch (act.type) {
    case '[editor] add editor cleanups': return { ...state,
      editor: updateLookup(act.pay.editorKey, state.editor, ({ cleanups }) => ({
        cleanups: cleanups.concat(act.pay.cleanups),
      }))
    };
    case '[editor] set monaco loaded': return { ...state,
      monacoLoaded: act.pay.loaded,
    };
    case '[editor] set monaco loading': return { ...state,
      monacoLoading: act.pay.loading,
    };
    case '[editor] set global types loaded': return { ...state,
      globalTypesLoaded: act.pay.loaded,
    };
    case '[editor] store monaco core': return { ...state,
      internal: act.pay.monacoInternal,
    };
    case '[editor] store monaco editor': return { ...state,
      editor: addToLookup({
        key: act.pay.editorKey,
        editor: act.pay.editor,
        lastDecorations: [],
        cleanups: [],
      }, state.editor),
    };
    case '[editor] store monaco model': return { ...state,
      model: addToLookup({
        key: act.pay.modelKey,
        model: act.pay.model,
        filename: act.pay.filename,
        uri: act.pay.uri,
      }, state.model),
    };
    case '[editor] store monaco service': return { ...state,
      monacoService: act.pay.service,
    };
    case '[editor] store sass': return { ...state,
      sassWorker: act.pay.worker,
    };
    case '[editor] store syntax': return { ...state,
      syntaxWorker: act.pay.worker,
    };
    case '[editor] update': return { ...state,
      ...act.pay.updates,
    };
    case '[editor] update editor': return { ...state,
      editor: updateLookup(act.pay.editorKey, state.editor, act.pay.updates),
    };
    default: return state || testNever(act);
  }
};

export const epic = combineEpics(
  // ...
);

// if (module.hot) {
//   /**
//    * Currently `Editor` crashes on hmr.
//    * TODO try to fix.
//    */
//   module.hot.decline();
// }
