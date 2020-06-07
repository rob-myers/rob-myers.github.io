// Get sass.js from node_modules, but sass.worker.js from public folder 
import Sass, { SassWorker } from 'sass.js/dist/sass';
import { combineEpics, StateObservable, ActionsObservable } from 'redux-observable';
import { map, filter } from 'rxjs/operators';

import { KeyedLookup, testNever } from '@model/generic.model';
import { Message } from '@model/worker.model';
import { createAct, ActionsUnion, Redacted, redact, addToLookup, removeFromLookup, updateLookup, ReduxUpdater } from '@model/store/redux.model';
import { createThunk } from '@model/store/root.redux.model';
import { IMonacoTextModel, Editor, TypescriptDefaults, Typescript, Monaco } from '@model/monaco/monaco.model';
import { MonacoService } from '@model/monaco/monaco.service';
import { SyntaxWorker, awaitWorker, MessageFromWorker } from '@worker/syntax/worker.model';
import SyntaxWorkerClass from '@worker/syntax/syntax.worker';
import { Classification } from '@worker/syntax/highlight.model';

import { RootState, filterActs, RootActOrThunk } from './reducer';

export interface State {
  hasTranspiled: boolean;
  /** Instances of monaco editor */
  editor: KeyedLookup<EditorInstance>;
  /** Internal monaco structures */
  internal: null | MonacoInternal;
  monacoLoading: boolean;
  /** Instances of monaco models */
  model: KeyedLookup<ModelInstance>;
  monacoService: null | Redacted<MonacoService>;
  typesLoaded: boolean;
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
  editorKey: string | null;
  model: Redacted<IMonacoTextModel>;
  filename: string;
}
interface MonacoInternal {
  typescriptDefaults: Redacted<TypescriptDefaults>;
  typescript: Redacted<Typescript>;
  monaco: Redacted<Monaco>;
}

const initialState: State = {
  hasTranspiled: false,
  editor: {},
  internal: null,
  monacoLoading: false,
  model: {},
  monacoService: null,
  typesLoaded: false,
  sassWorker: null,
  syntaxWorker: null,
};

export const Act = {
  storeMonacoEditor: (input: { editorKey: string; editor: Redacted<Editor> }) =>
    createAct('[worker] store monaco editor', input),
  setMonacoInternal: (monacoInternal: MonacoInternal) =>
    createAct('[worker] store monaco core', { monacoInternal }),
  setMonacoService: (service: Redacted<MonacoService>) =>
    createAct('[worker] store monaco service', { service }),
  storeMonacoModel: (input: {
    editorKey: null | string;
    modelKey: string;
    model: Redacted<IMonacoTextModel>;
    filename: string;
  }) =>
    createAct('[worker] store monaco model', input),
  storeSassWorker: ({ worker }: { worker: Redacted<SassWorker> }) =>
    createAct('[worker] store sass', { worker }),
  storeSyntaxWorker: ({ worker }: { worker: Redacted<SyntaxWorker> }) =>
    createAct('[worker] store syntax', { worker }),
  update: (updates: Partial<State>) =>
    createAct('[worker] update', { updates }),
  updateEditor: (editorKey: string, updates: ReduxUpdater<EditorInstance>) =>
    createAct('[worker] update editor', { editorKey, updates }),
};

export type Action = ActionsUnion<typeof Act>;

export const Thunk = {
  bootstrapMonaco: createThunk(
    '[worker] bootstrap monaco',
    async ({ dispatch }, monacoInternal: MonacoInternal) => {
      dispatch(Act.update({ monacoLoading: true }));
      // Dynamic import keeps monaco out of main bundle
      const { MonacoService } = await import('@model/monaco/monaco.service');
      const service = redact(new MonacoService);
      dispatch(Act.setMonacoService(service));

      dispatch(Act.setMonacoInternal(monacoInternal));
      dispatch(Thunk.setMonacoCompilerOptions({}));
      await dispatch(Thunk.ensureMonacoTypes({}));
      monacoInternal.monaco.editor.setTheme('vs-dark'); // Dark theme
    },
  ),
  createMonacoEditor: createThunk(
    '[worker] create monaco editor',
    async ({ dispatch, state: { editor: worker } }, { editor, editorKey, model, modelKey, filename }: {
      editor: Redacted<Editor>;
      editorKey: string;
      modelKey: string;
      model: Redacted<IMonacoTextModel>;
      filename: string;
    }) => {
      dispatch(Act.storeMonacoEditor({ editor, editorKey }));
      dispatch(Act.updateEditor(editorKey, () => ({ cleanups: [() => editor.dispose()] })));
      dispatch(Thunk.tsxEditorInstanceSetup({ editor }));

      if (!worker.model[modelKey]) {
        model.updateOptions({ tabSize: 2, indentSize: 2, trimAutoWhitespace: true });
        dispatch(Act.storeMonacoModel({ model, modelKey, editorKey, filename }));
      }
      if (!worker.syntaxWorker) {
        const syntaxWorker = new SyntaxWorkerClass;
        dispatch(Act.storeSyntaxWorker({ worker: redact(syntaxWorker) }));
        await awaitWorker('worker-ready', syntaxWorker);
      }
      if (filename.endsWith('.tsx')) {
        await dispatch(Thunk.setupEditorHighlighting({ editorKey }));
      }
      if (worker.monacoLoading) {
        dispatch(Act.update({ monacoLoading: false }));
      }
      if (!worker.sassWorker) {
        Sass.setWorkerUrl('/sass.worker.js');
        const sassWorker = new Sass;
        dispatch(Act.storeSassWorker({ worker: redact(sassWorker) }));
        // sassWorker.compile('.foo { .bar { color: red; } }', (result) => console.log({ result }));
      }
    },
  ),
  /** Ensures types associated to globals */
  ensureMonacoTypes: createThunk(
    '[worker] ensure monaco types',
    async ({ state: { editor: worker }, dispatch }) => {
      const { typescriptDefaults } = worker.internal!;
      // Load types then turn type checking back on
      typescriptDefaults.setDiagnosticsOptions({ noSemanticValidation: true });
      await worker.monacoService!.loadReactTypes(typescriptDefaults);
      typescriptDefaults.setDiagnosticsOptions({ noSemanticValidation: false });
      dispatch(Act.update({ typesLoaded: true }));
    },
  ),
  /** Execute a debounced action whenever editor model changes. */
  onModelChange: createThunk(
    '[worker] on model change',
    ({ state: { editor: { editor } } }, { act, editorKey, debounceMs }: {
      act: () => void;
      debounceMs: number; 
      editorKey: string;
    }) => {
      let debounceId: number;
      editor[editorKey]?.editor.onDidChangeModelContent((_event) => {
        window.clearTimeout(debounceId);
        debounceId = window.setTimeout(act, debounceMs);
      });
    },
  ),
  removeMonacoEditor: createThunk(
    '[worker] remove monaco editor',
    ({ dispatch, state: { editor: { editor, model: monacoModel } }}, { editorKey }: { editorKey: string }) => {
      editor[editorKey].cleanups.forEach(cleanup => cleanup());
      dispatch(Act.update({
        editor: removeFromLookup(editorKey, editor),
        // Remove stale editorKey for extant models
        model: Object.entries(monacoModel).reduce((agg, [key, value]) => ({ ...agg,
          [key]: { ...value, ...(value.editorKey === editorKey && { editorKey: null }) },
        }), {} as State['model']),
      }));
    },
  ),
  removeMonacoModel: createThunk(
    '[worker] remove monaco model',
    ({ dispatch, state: { editor: { model } }
    }, { modelKey }: { modelKey: string }) => {
      model[modelKey]?.model.dispose();
      dispatch(Act.update({ model: removeFromLookup(modelKey, model) }));
    },
  ),
  resizeEditor: createThunk(
    '[worker] resize editor',
    ({ state: { editor: worker } }, { editorKey }: { editorKey: string }) => {
      worker.editor[editorKey].editor.layout();
    },
  ),
  setMonacoCompilerOptions: createThunk(
    '[worker] set monaco compiler options',
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
  setupEditorHighlighting: createThunk(
    '[worker] setup syntax',
    async ({ state: { editor: worker }, dispatch }, { editorKey }: { editorKey: string }) => {
      const eventListener = ({ data }: Message<MessageFromWorker>) => {
        if (data.key === 'send-tsx-highlights' && data.editorKey === editorKey) {
          requestAnimationFrame(() =>
            dispatch(Thunk.updateEditorDecorations({ editorKey, classifications: data.classifications })));
        }
      };
      worker.syntaxWorker!.addEventListener('message', eventListener);
      const syntaxHighlight = () => dispatch(Thunk.syntaxHighlight({ editorKey }));
      const disposable = worker.editor[editorKey].editor.onDidChangeModelContent(syntaxHighlight);
      requestAnimationFrame(syntaxHighlight); // For first time load

      dispatch(Act.updateEditor(editorKey, ({ cleanups }) => ({
        cleanups: cleanups.concat(
          () => worker.syntaxWorker?.removeEventListener('message', eventListener),
          () => disposable.dispose(),
        ),
      })));
    },
  ),
  syntaxHighlight: createThunk(
    '[worker] syntax highlight',
    ({ state: { editor: worker } }, { editorKey }: { editorKey: string }) => {
      const { editor } = worker.editor[editorKey];
      if (!editor.getModel()) {
        return;
      }
      if (/typescript|javascript/i.test(editor.getModel()!.getModeId())) {
        worker.syntaxWorker!.postMessage({
          key: 'request-tsx-highlights',
          editorKey,
          code: editor.getValue(),
        });
      }
    },
  ),
  transformTranspiledTsx: createThunk(
    '[worker] transform transpiled tsx',
    ({ state: { editor: _ } }, { js }: { js: string }) => {
      const transformedJs = js.replace(
        /import ([^\n]+) from 'react'/g, // TODO use syntax worker
        `import $1 from '${window.location.origin}/es-react/react.js'`,
      );
      console.log({ transformedJs });
      return transformedJs;
    },
  ),
  transpileModel: createThunk(
    '[worker] transpile monaco model',
    async ({ state: { editor: worker }, dispatch }, { modelKey }: { modelKey: string }) => {
      const { model } = worker.model[modelKey];
      const result = await worker.monacoService!.transpile(model);
      if (!worker.hasTranspiled) {
        dispatch(Act.update({ hasTranspiled: true }));
      }
      return result;
    },
  ),
  tsxEditorInstanceSetup: createThunk(
    '[worker] editor instance setup',
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
    '[worker] update editor decorations',
    ({ state: { editor: worker }, dispatch }, { editorKey, classifications }: {
      editorKey: string;
      classifications: Classification[];
    }) => {
      const { lastDecorations, editor } = worker.editor[editorKey];
      
      const decorations = classifications.map(classification => {
        // const inlineClassName = `is-${classification.kind} in-${classification.parentKind}`;
        const inlineClassName = classification.kind;
        return {
          range: new worker.internal!.monaco.Range(
            classification.startLineNumber,
            classification.startColumn,
            classification.endLineNumber,
            classification.endColumn,
          ),
          options: {
            inlineClassName,
          },
        };
      });
      const nextDecorations = editor.deltaDecorations(lastDecorations, decorations);
      dispatch(Act.updateEditor(editorKey, () => ({ lastDecorations: nextDecorations })));
    },
  ),
  useMonacoModel: createThunk(
    '[worker] use monaco model',
    ({ dispatch, state: { editor: { editor } } }, { editorKey, model, modelKey, filename }: {
      editorKey: string;
      modelKey: string;
      model: Redacted<IMonacoTextModel>;
      filename: string;
    }) => {
      if (editor[editorKey]) {
        dispatch(Act.storeMonacoModel({ editorKey, modelKey, model: redact(model), filename }));
        editor[editorKey].editor.setModel(model);
      }
    },
  ),
};

export type Thunk = ActionsUnion<typeof Thunk>;

export const reducer = (state = initialState, act: Action): State => {
  switch (act.type) {
    case '[worker] store monaco core': return { ...state,
      internal: act.pay.monacoInternal,
    };
    case '[worker] store monaco editor': return { ...state,
      editor: addToLookup({
        key: act.pay.editorKey,
        editor: act.pay.editor,
        lastDecorations: [],
        cleanups: [],
      }, state.editor),
    };
    case '[worker] store monaco model': return { ...state,
      model: addToLookup({
        key: act.pay.modelKey,
        model: act.pay.model,
        editorKey: act.pay.editorKey,
        filename: act.pay.filename,
      }, state.model),
    };
    case '[worker] store monaco service': return { ...state,
      monacoService: act.pay.service,
    };
    case '[worker] store sass': return { ...state,
      sassWorker: act.pay.worker,
    };
    case '[worker] store syntax': return { ...state,
      syntaxWorker: act.pay.worker,
    };
    case '[worker] update': return { ...state,
      ...act.pay.updates,
    };
    case '[worker] update editor': return { ...state,
      editor: updateLookup(act.pay.editorKey, state.editor, act.pay.updates),
    };
    default: return state || testNever(act);
  }
};

const resizeMonacoEpic = (
  action$: ActionsObservable<RootActOrThunk>,
  state$: StateObservable<RootState>,
) =>
  action$.pipe(
    filterActs('[layout] panel resized'),
    filter(({ pay: { panelKey } }) =>
      !!state$.value.editor.editor[`editor-${panelKey}`]),
    map(({ pay: { panelKey } }) =>
      Thunk.resizeEditor({ editorKey: `editor-${panelKey}` })),
  );

// TODO move to new duck i.e. dev-env.duck
// TODO rename worker.duck as editor.duck
const togglePanelMenuEpic = (
  action$: ActionsObservable<RootActOrThunk>,
  _state$: StateObservable<RootState>,
) =>
  action$.pipe(
    filterActs('[layout] clicked panel title'),
    map(({ args: { panelKey } }) => {
      console.log({ detectedTitleClick: panelKey });
      return { type: 'fake' } as any;
    })
  );

export const epic = combineEpics(
  resizeMonacoEpic,
  togglePanelMenuEpic,
);
