// Get sass.js from node_modules, but sass.worker.js from public folder 
import Sass, { SassWorker } from 'sass.js/dist/sass';
import { combineEpics } from 'redux-observable';
import { map, filter } from 'rxjs/operators';

import { KeyedLookup, testNever } from '@model/generic.model';
import { Message } from '@model/worker.model';
import { createAct, ActionsUnion, Redacted, redact, addToLookup, removeFromLookup, updateLookup, ReduxUpdater } from '@model/store/redux.model';
import { createThunk, createEpic } from '@model/store/root.redux.model';
import { IMonacoTextModel, Editor, TypescriptDefaults, Typescript, Monaco, Uri, IMarkerData, ScssTranspilationResult } from '@model/monaco/monaco.model';
import { MonacoService } from '@model/monaco/monaco.service';
import { SyntaxWorker, awaitWorker, MessageFromWorker } from '@worker/syntax/worker.model';
import SyntaxWorkerClass from '@worker/syntax/syntax.worker';
import { Classification } from '@worker/syntax/highlight.model';
import { filterActs } from './reducer';
import { filenameToModelKey } from '@model/code/dev-env.model';


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
  bootstrapMonaco: createThunk(
    '[editor] bootstrap monaco',
    async ({ dispatch }, monacoInternal: MonacoInternal) => {
      dispatch(Act.setMonacoLoading(true));
      // Dynamic import keeps monaco out of main bundle
      const { MonacoService } = await import('@model/monaco/monaco.service');
      const service = redact(new MonacoService);
      dispatch(Act.setMonacoService(service));

      dispatch(Act.setMonacoInternal(monacoInternal));
      monacoInternal.typescriptDefaults.setEagerModelSync(true);
      dispatch(Thunk.setMonacoCompilerOptions({}));
      await dispatch(Thunk.loadGlobalTypes({}));
      monacoInternal.monaco.editor.setTheme('vs-dark'); // Dark theme
    },
  ),
  computeTsImportExports: createThunk(
    '[editor] compute ts import/export meta',
    async ({ state: { editor } }, input: { filename: string } & (
      { code: string } | { modelKey: string }
    )) => {
      const code = 'code' in input ? input.code : editor.model[input.modelKey].model.getValue();
      const worker = editor.syntaxWorker!;
      worker.postMessage({ key: 'request-import-exports', code, filename: input.filename });
      return await awaitWorker('send-import-exports', worker, ({ origCode }) => code === origCode);
    },
  ),
  createMonacoEditor: createThunk(
    '[editor] create monaco editor',
    async ({ dispatch, state: { editor: e }, getState }, { editor, editorKey, model, modelKey, filename }: {
      editor: Redacted<Editor>;
      editorKey: string;
      modelKey: string;
      model: Redacted<IMonacoTextModel>;
      filename: string;
    }) => {
      dispatch(Act.storeMonacoEditor({ editor, editorKey }));
      dispatch(Act.addEditorCleanups({ editorKey, cleanups: [() => editor.dispose()] }));
      dispatch(Thunk.tsxEditorInstanceSetup({ editor }));

      if (!e.model[modelKey]) {
        const uri = redact(e.internal!.monaco.Uri.parse(`file:///${filename}`));
        dispatch(Act.storeMonacoModel({ model, modelKey, filename, uri }));
      }
      model.updateOptions({ tabSize: 2, indentSize: 2, trimAutoWhitespace: true });

      if (!e.syntaxWorker) {
        const syntaxWorker = new SyntaxWorkerClass;
        dispatch(Act.storeSyntaxWorker({ worker: redact(syntaxWorker) }));
        await awaitWorker('worker-ready', syntaxWorker);
      }
      if (filename.endsWith('.tsx')) {
        await dispatch(Thunk.setupTsxHighlighting({ editorKey }));
      }
      if (!getState().editor.sassWorker) {
        Sass.setWorkerUrl('/sass.worker.js');
        const sassWorker = new Sass;
        dispatch(Act.storeSassWorker({ worker: redact(sassWorker) }));
        // sassWorker.writeFile('test.scss', '@mixin myMixin { width: 123px; }');
        // sassWorker.compile('@import "test.scss"; .foo { @include myMixin; .bar { color: red; } }', (sassTestResult) => console.log({ sassTestResult }));
      }
      if (getState().editor.monacoLoading) {
        dispatch(Act.setMonacoLoading(false));
        dispatch(Act.setMonacoLoaded(true));
      }
    },
  ),
  ensureMonacoModel: createThunk(
    '[editor] ensure monaco model',
    ({ state: { editor }, dispatch }, { filename, code }: { filename: string; code: string }) => {
      const { internal, model: m } = editor;
      const { monaco } = internal!;
      /** Note the additional prefix file:/// */
      const uri = monaco.Uri.parse(`file:///${filename}`);
      const model = monaco.editor.getModel(uri) || monaco.editor.createModel(code, undefined, uri);
      
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
  getScssImportIntervals: createThunk(
    '[editor] get scss import intervals',
    ({ state: { editor } }, { scssText }: { scssText: string }) => {
      return editor.monacoService!.getScssImportIntervals(scssText);
    },
  ),
  /** Load types associated to globals */
  loadGlobalTypes: createThunk(
    '[editor] ensure monaco types',
    async ({ state: { editor: worker }, dispatch }) => {
      const { typescriptDefaults } = worker.internal!;
      dispatch(Thunk.setTsDiagnostics({ mode: 'off' }));
      await worker.monacoService!.loadReactTypes(typescriptDefaults);
      dispatch(Thunk.setTsDiagnostics({ mode: 'on' }));
      dispatch(Act.setGlobalTypesLoaded(true));
    },
  ),
  highlightTsxSyntax: createThunk(
    '[editor] highlight tsx syntax',
    ({ state: { editor: worker } }, { editorKey }: { editorKey: string }) => {
      const { editor } = worker.editor[editorKey];
      const model = editor.getModel();
      if (model && /typescript|javascript/i.test(model.getModeId())) {
        worker.syntaxWorker!.postMessage({
          key: 'request-tsx-highlights',
          editorKey,
          code: editor.getValue(),
        });
      }
    },
  ),
  removeMonacoEditor: createThunk(
    '[editor] remove monaco editor',
    ({ dispatch, state: { editor: { editor } }}, { editorKey }: { editorKey: string }) => {
      editor[editorKey].cleanups.forEach(cleanup => cleanup());
      dispatch(Act.update({ editor: removeFromLookup(editorKey, editor) }));
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
      e.internal!.monaco.editor.setModelMarkers(model, 'eslint', markers);
    },
  ),
  setMonacoCompilerOptions: createThunk(
    '[editor] set monaco compiler options',
    ({ state: { editor: { internal: monacoInternal } } }) => {
      const { typescriptDefaults, typescript } = monacoInternal!;
      const oldCompilerOptions = typescriptDefaults.getCompilerOptions();
      typescriptDefaults.setCompilerOptions({
        // The compiler options used here generally should *not* be strict, to make quick edits easier
        experimentalDecorators: true,
        preserveConstEnums: true,
        // implicit global `this` usage is almost always a bug
        noImplicitThis: true,
        // ...compilerOptions,
        // These options are essential to making the transform/eval and types code work (no overriding)
        allowNonTsExtensions: true,
        target: typescript.ScriptTarget.ES2015,
        jsx: typescript.JsxEmit.React,
        module: typescript.ModuleKind.ESNext,
        baseUrl: 'file:///',
        // This is updated after types are loaded, so preserve the old setting
        paths: oldCompilerOptions.paths,
        // Generate d.ts content in `emitOutput.outputFiles[1]`
        declaration: true,
        // allowSyntheticDefaultImports: true,
      });
    },
  ),
  setupTsxHighlighting: createThunk(
    '[editor] setup tsx highlighting',
    async ({ state: { editor: worker }, dispatch }, { editorKey }: { editorKey: string }) => {
      const eventListener = ({ data }: Message<MessageFromWorker>) => {
        if (data.key === 'send-tsx-highlights' && data.editorKey === editorKey) {
          requestAnimationFrame(() =>
            dispatch(Thunk.updateEditorDecorations({ editorKey, classifications: data.classifications })));
        }
      };
      worker.syntaxWorker!.addEventListener('message', eventListener);
      const syntaxHighlight = () => dispatch(Thunk.highlightTsxSyntax({ editorKey }));
      const disposable = worker.editor[editorKey].editor.onDidChangeModelContent(syntaxHighlight);
      requestAnimationFrame(syntaxHighlight); // For first time load

      dispatch(Act.addEditorCleanups({ editorKey, cleanups: [
        () => worker.syntaxWorker?.removeEventListener('message', eventListener),
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
  /** Execute a debounced action whenever editor model changes. */
  trackModelChange: createThunk(
    '[editor] on model change',
    ({ state: { editor: { model } } }, { do: act, modelKey, debounceMs }: {
      do: (newValue: string) => void;
      debounceMs: number; 
      modelKey: string;
    }) => {
      let debounceId: number;
      return model[modelKey]?.model.onDidChangeContent((_event) => {
        window.clearTimeout(debounceId);
        const newValue = model[modelKey].model.getValue();
        debounceId = window.setTimeout(() => act(newValue), debounceMs);
      });
    },
  ),
  transpileScssMonacoModel: createThunk(
    '[editor] transpile scss monaco model',
    async (
      { state: { editor } },
      { modelKey }: { modelKey: string },
    ): Promise<ScssTranspilationResult> => {
      const { sassWorker, model: m, monacoService } = editor;
      const contents = m[modelKey].model.getValue();
      /**
       * TODO transitive @imports
       * - try to build filename stratification: string[][]
       * - if successful inductively add files then compile
       */
      const importIntervals = monacoService!.getScssImportIntervals(contents);
      const importedFilenames = importIntervals.map(({ value }) => value);
      console.log({ sassImported: importedFilenames });

      // for (const importedFilename of importedFilenames) {
      //   const model = m[filenameToModelKey(importedFilename)];
      //   if (!model) {
      //     return { key: 'error', errorKey: 'missing-import', dependency: importedFilename };
      //   }
      // }
      // sassWorker.writeFile('one.scss', '.one { width: 123px; }');

      return new Promise((resolve, _reject) => {
        sassWorker?.compile(contents, (result) => {
          console.log({ sassWorkerResult: result });
          resolve('text' in result
            ? { key: 'success', src: contents, dst: result.text }
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
  tsxEditorInstanceSetup: createThunk(
    '[editor] editor instance setup',
    ({ state: { editor: worker } }, { editor }: { editor: EditorInstance['editor'] }) => {
      const { monaco } = worker.internal!;
      editor.addAction({
        id: 'editor.action.commentLine',
        label: 'Custom Toggle Line Comment',
        run: (editor) => { 
          console.log('TODO comment line', editor.getPosition(), editor.getSelection());
        },
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.US_SLASH],
      });
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

const resizeMonacoEpic = createEpic(
  (action$, state$) =>
    action$.pipe(
      filterActs('[layout] panel resized'),
      filter(({ pay: { panelKey } }) =>
        !!state$.value.editor.editor[`editor-${panelKey}`]),
      map(({ pay: { panelKey } }) =>
        Thunk.resizeEditor({ editorKey: `editor-${panelKey}` })),
    ));

export const epic = combineEpics(
  resizeMonacoEpic,
);
