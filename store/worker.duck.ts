import { ReplaySubject } from 'rxjs';
// Get sass.js from node_modules, but sass.worker.js from public/ 
import Sass, { SassWorker } from 'sass.js/dist/sass';

import { KeyedLookup, testNever } from '@model/generic.model';
import { createAct, ActionsUnion, Redacted, redact, addToLookup, removeFromLookup, updateLookup } from '@model/store/redux.model';
import { createThunk } from '@model/store/root.redux.model';
import { IMonacoTextModel, loadReactTypes, Editor, TypescriptDefaults, Typescript, Monaco } from '@model/monaco';
import { SyntaxWorker, awaitWorker, MessageFromWorker } from '@worker/syntax/worker.model';
import SyntaxWorkerClass from '@worker/syntax/syntax.worker';
import { Classification } from '@worker/syntax/highlight.model';
import { Message } from '@model/worker.model';

export interface State {
  /** Internal monaco structures */
  monacoInternal: null | MonacoInternal;
  monacoTypesLoaded: boolean;
  /** Instances of monaco editor */
  monacoEditor: KeyedLookup<MonacoEditorInstance>;
  /** Instances of monaco models */
  monacoModel: KeyedLookup<MonacoModelInstance>;
  sassWorker: null | Redacted<SassWorker>;
  syntaxWorker: null | Redacted<SyntaxWorker>;
}

interface MonacoInternal {
  typescriptDefaults: Redacted<TypescriptDefaults>;
  typescript: Redacted<Typescript>;
  monaco: Redacted<Monaco>;
}

interface MonacoEditorInstance {
  key: string;
  editor: Redacted<Editor>;
  lastDecorations: string[];
  unregisterSyntax: () => void;
  /** Triggered on model change */
  stream: Redacted<ReplaySubject<null>>;
}
interface MonacoModelInstance {
  key: string;
  editorKey: string | null;
  model: Redacted<IMonacoTextModel>;
  filename: string;
}

const initialState: State = {
  monacoTypesLoaded: false,
  monacoEditor: {},
  monacoModel: {},
  monacoInternal: null,
  sassWorker: null,
  syntaxWorker: null,
};

export const Act = {
  storeMonacoEditor: (input: {
    editorKey: string;
    editor: Redacted<Editor>;
    stream: MonacoEditorInstance['stream'];
  }) =>
    createAct('[worker] store monaco editor', input),
  setMonacoInternal: (monacoInternal: MonacoInternal) =>
    createAct('[worker] store monaco core', { monacoInternal }),
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
  updateEditor: (editorKey: string, updates: Partial<MonacoEditorInstance>) =>
    createAct('[worker] update editor', { editorKey, updates }),
};

export type Action = ActionsUnion<typeof Act>;

export const Thunk = {
  bootstrapMonaco: createThunk(
    '[worker] bootstrap monaco',
    async ({ dispatch }, monacoInternal: MonacoInternal) => {
      dispatch(Act.setMonacoInternal(monacoInternal));
      dispatch(Thunk.setMonacoCompilerOptions({}));
      await dispatch(Thunk.ensureMonacoTypes({}));
      monacoInternal.monaco.editor.setTheme('vs-dark'); // Dark theme
    },
  ),
  createMonacoEditor: createThunk(
    '[worker] create monaco editor',
    async ({ dispatch, state: { worker } }, { editor, editorKey, model, modelKey, filename }: {
      editor: Redacted<Editor>;
      editorKey: string;
      modelKey: string;
      model: Redacted<IMonacoTextModel>; // TODO optional
      filename: string;
    }) => {

      const stream = new ReplaySubject<null>();
      dispatch(Act.storeMonacoEditor({ editor, editorKey, stream: redact(stream) }));
      dispatch(Act.storeMonacoModel({ model, modelKey, editorKey, filename }));

      if (!worker.syntaxWorker) {
        const syntaxWorker = new SyntaxWorkerClass;
        dispatch(Act.storeSyntaxWorker({ worker: redact(syntaxWorker) }));
        await awaitWorker('worker-ready', syntaxWorker);
      }
      await dispatch(Thunk.setupEditorHighlighting({ editorKey }));

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
    async ({ state: { worker }, dispatch }) => {
      const { typescriptDefaults } = worker.monacoInternal!;
      // Load types then turn type checking back on
      typescriptDefaults.setDiagnosticsOptions({ noSemanticValidation: true });
      await loadReactTypes(typescriptDefaults);
      typescriptDefaults.setDiagnosticsOptions({ noSemanticValidation: false });
      dispatch(Act.update({ monacoTypesLoaded: true }));
    },
  ),
  removeMonacoEditor: createThunk(
    '[worker] remove monaco editor',
    ({ dispatch, state: { worker: { monacoEditor, monacoModel } }}, { editorKey }: { editorKey: string }) => {
      monacoEditor[editorKey]?.editor.dispose();
      monacoEditor[editorKey]?.unregisterSyntax();

      dispatch(Act.update({
        monacoEditor: removeFromLookup(editorKey, monacoEditor),
        monacoModel: Object.entries(monacoModel).reduce((agg, [key, value]) => ({ ...agg,
          [key]: { ...value, ...(value.editorKey === editorKey && { editorKey: null }) },
        }), {} as State['monacoModel']),
      }));
    },
  ),
  removeMonacoModel: createThunk(
    '[worker] remove monaco model',
    ({ dispatch, state: { worker: { monacoModel } }
    }, { modelKey }: { modelKey: string }) => {
      monacoModel[modelKey]?.model.dispose();
      dispatch(Act.update({ monacoModel: removeFromLookup(modelKey, monacoModel) }));
    },
  ),
  setMonacoCompilerOptions: createThunk(
    '[worker] set monaco compiler options',
    ({ state: { worker: { monacoInternal } } }) => {
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
      });
    },
  ),
  /**
   * Source https://github.com/rekit/rekit-studio/blob/master/src/features/editor/setupSyntaxWorker.js
   */
  setupEditorHighlighting: createThunk(
    '[worker] setup syntax',
    async ({ state: { worker }, dispatch }, { editorKey }: { editorKey: string }) => {
      const eventListener = ({ data }: Message<MessageFromWorker>) => {
        if (data.key === 'send-tsx-highlights' && data.editorKey === editorKey) {
          requestAnimationFrame(() =>
            dispatch(Thunk.updateEditorDecorations({ editorKey, classifications: data.classifications })));
        }
      };
      worker.syntaxWorker!.addEventListener('message', eventListener);
      const syntaxHighlight = () => dispatch(Thunk.syntaxHighlight({ editorKey }));
      const { editor } = worker.monacoEditor[editorKey];
      editor.onDidChangeModelContent(syntaxHighlight);
      editor.onDidChangeModel(syntaxHighlight);
      requestAnimationFrame(syntaxHighlight); // For first time load

      dispatch(Act.updateEditor(editorKey, {
        unregisterSyntax: () => worker.syntaxWorker!.removeEventListener('message', eventListener),
      }));
    },
  ),
  syntaxHighlight: createThunk(
    '[worker] syntax highlight',
    ({ state: { worker } }, { editorKey }: { editorKey: string }) => {
      const { editor } = worker.monacoEditor[editorKey];
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
  updateEditorDecorations: createThunk(
    '[worker] update editor decorations',
    ({ state: { worker }, dispatch }, { editorKey, classifications }: {
      editorKey: string;
      classifications: Classification[];
    }) => {
      const { lastDecorations, editor } = worker.monacoEditor[editorKey];
      
      const decorations = classifications.map(classification => {
        // const inlineClassName = `is-${classification.kind} in-${classification.parentKind}`;
        const inlineClassName = classification.kind;
        return {
          range: new worker.monacoInternal!.monaco.Range(
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
      dispatch(Act.updateEditor(editorKey, { lastDecorations: nextDecorations }));
    },
  ),
  useMonacoModel: createThunk(
    '[worker] use monaco model',
    ({ dispatch, state: { worker: { monacoEditor } } }, { editorKey, model, modelKey, filename }: {
      editorKey: string;
      modelKey: string;
      model: Redacted<IMonacoTextModel>;
      filename: string;
    }) => {
      if (monacoEditor[editorKey]) {
        dispatch(Act.storeMonacoModel({ editorKey, modelKey, model: redact(model), filename }));
        monacoEditor[editorKey].editor.setModel(model);
      }
    },
  ),
};

export type Thunk = ActionsUnion<typeof Thunk>;

export const reducer = (state = initialState, act: Action): State => {
  switch (act.type) {
    case '[worker] store monaco core': return { ...state,
      monacoInternal: act.pay.monacoInternal,
    };
    case '[worker] store monaco editor': return { ...state,
      monacoEditor: addToLookup({
        key: act.pay.editorKey,
        editor: act.pay.editor,
        lastDecorations: [],
        unregisterSyntax: () => null,
        stream: act.pay.stream,
      }, state.monacoEditor),
    };
    case '[worker] store monaco model': return { ...state,
      monacoModel: addToLookup({
        key: act.pay.modelKey,
        model: act.pay.model,
        editorKey: act.pay.editorKey,
        filename: act.pay.filename,
      }, state.monacoModel),
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
      monacoEditor: updateLookup(act.pay.editorKey, state.monacoEditor, () => ({ ...act.pay.updates })),
    };
    default: return state || testNever(act);
  }
};
