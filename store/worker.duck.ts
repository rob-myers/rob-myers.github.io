import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as monaco from 'monaco-editor';
import { getWindow } from '@model/dom.model';
import { KeyedLookup, testNever } from '@model/generic.model';
import { createAct, ActionsUnion, Redacted, redact, addToLookup, removeFromLookup, updateLookup } from '@model/store/redux.model';
import { createThunk } from '@model/store/root.redux.model';
import { IPackageGroup, TypescriptDeps, TsDefaults, SUPPORTED_PACKAGES, IMonacoTextModel, loadTypes } from '@model/monaco';
import { SyntaxWorker, awaitWorker } from '@worker/syntax/worker.model';
import SyntaxWorkerClass from '@worker/syntax/syntax.worker';
import { Classification } from '@worker/syntax/highlight.model';

type Editor = monaco.editor.IStandaloneCodeEditor;

interface MonacoEditorInstance {
  key: string;
  editor: Redacted<Editor>;
  lastDecorations: string[];
}
interface MonacoModelInstance {
  key: string;
  editorKey: string | null;
  model: Redacted<IMonacoTextModel>;
  filename: string;
}
interface MonacoRangeClass {
  new (startLine: number, start: number, endLine: number, end: number): monaco.Range;
}

export interface State {
  syntaxWorker: null | Redacted<SyntaxWorker>;
  monacoGlobalsLoaded: boolean;
  monacoTypesLoaded: boolean;
  monacoSupportedPkgs: IPackageGroup[];
  monacoEditor: KeyedLookup<MonacoEditorInstance>;
  monacoModel: KeyedLookup<MonacoModelInstance>;
  /** Monaco range class */
  monacoRange: null | Redacted<MonacoRangeClass>;
}

const initialState: State = {
  syntaxWorker: null,
  monacoGlobalsLoaded: false,
  monacoTypesLoaded: false,
  monacoSupportedPkgs: SUPPORTED_PACKAGES,
  monacoEditor: {},
  monacoModel: {},
  monacoRange: null,
};

export const Act = {
  storeSyntaxWorker: ({ worker }: { worker: Redacted<SyntaxWorker> }) =>
    createAct('[worker] store syntax', { worker }),
  storeMonacoEditor: ({ editorKey, editor }: {
    editorKey: string;
    editor: Redacted<Editor>;
  }) =>
    createAct('[worker] store monaco editor', { editorKey, editor }),
  storeMonacoModel: ({ editorKey, model, modelKey, filename }: {
    editorKey: null | string;
    modelKey: string;
    model: Redacted<IMonacoTextModel>;
    filename: string;
  }) =>
    createAct('[worker] store monaco model', { editorKey, model, modelKey, filename }),
  update: (updates: Partial<State>) =>
    createAct('[worker] update', { updates }),
  updateEditor: (editorKey: string, updates: Partial<MonacoEditorInstance>) =>
    createAct('[worker] update editor', { editorKey, updates }),
};

export type Action = ActionsUnion<typeof Act>;

export const Thunk = {
  removeMonacoEditor: createThunk(
    '[worker] remove monaco editor',
    ({ dispatch, state: { worker: { monacoEditor, monacoModel } }}, { editorKey }: { editorKey: string }) => {
      monacoEditor[editorKey]?.editor.dispose();
      dispatch(Act.update({
        monacoEditor: removeFromLookup(editorKey, monacoEditor),
        monacoModel: Object.entries(monacoModel).reduce((agg, [key, value]) => ({
          ...agg,
          [key]: { ...value, ...(value.editorKey === editorKey && { editorKey: null }) },
        }), {} as State['monacoModel']),
      }));
    },
  ),
  removeMonacoModel: createThunk(
    '[worker] remove monaco model',
    ({
      dispatch,
      state: { worker: { monacoModel } }
    }, { modelKey }: { modelKey: string }) => {
      monacoModel[modelKey]?.model.dispose();
      dispatch(Act.update({ monacoModel: removeFromLookup(modelKey, monacoModel) }));
    },
  ),
  createMonacoEditor: createThunk(
    '[worker] create monaco editor',
    async ({ dispatch, state: { worker } }, {
      editor,
      editorKey,
      typescript,
      typescriptDefaults,
      javascriptDefaults, // Needed?
      //
      model,
      modelKey,
      filename,
      monacoRange,
    }: TypescriptDeps & { monacoRange: Redacted<MonacoRangeClass> } & {
      editor: Redacted<Editor>;
      editorKey: string;
      modelKey: string;
      model: Redacted<IMonacoTextModel>; // TODO optional
      filename: string;
    }) => {
      dispatch(Thunk.setMonacoCompilerOptions({ typescript, typescriptDefaults, javascriptDefaults }));
      dispatch(Act.update({ monacoRange }));
      dispatch(Act.storeMonacoEditor({ editor, editorKey }));
      dispatch(Act.storeMonacoModel({ model, modelKey, editorKey, filename }));
      !worker.monacoGlobalsLoaded && await dispatch(Thunk.ensureMonacoGlobals({}));
      !worker.monacoTypesLoaded && await dispatch(Thunk.ensureMonacoTypes({ typescriptDefaults, javascriptDefaults }));
      await dispatch(Thunk.ensureSyntaxWorker({ editorKey }));
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
  /**
   * NOTE supported packages currently empty. Examples at:
   * https://github.com/microsoft/fluentui/blob/master/packages/tsx-editor/src/utilities/defaultSupportedPackages.ts
   */
  ensureMonacoGlobals: createThunk(
    '[worker] ensure monaco globals',
    async ({ state: { worker }, dispatch }) => {
      const self = getWindow();
      if (self) {
        !self.React && (self.React = React);
        !self.ReactDOM && (self.ReactDOM = ReactDOM);
        await Promise.all(
          worker.monacoSupportedPkgs.map(group => {
            if (!self[group.globalName]) {
              return new Promise<any>(resolve => {
                // handle either promise or callback function
                const globalResult = group.loadGlobal(resolve);
                if (globalResult && (globalResult as PromiseLike<any>).then) {
                  globalResult.then(resolve);
                }
              }).then((globalModule: any) => (self[group.globalName] = globalModule));
            }
          }),
        );
        dispatch(Act.update({ monacoGlobalsLoaded: true }));
      }
    },
  ),
  /** Ensures types associated to globals */
  ensureMonacoTypes: createThunk(
    '[worker] ensure monaco types',
    async ({ state: { worker }, dispatch }, { typescriptDefaults, javascriptDefaults }: TsDefaults) => {
      // Initially disable type checking
      typescriptDefaults.setDiagnosticsOptions({ noSemanticValidation: true });
      // Load types and then turn on full type checking
      await loadTypes(worker.monacoSupportedPkgs, { typescriptDefaults, javascriptDefaults });
      typescriptDefaults.setDiagnosticsOptions({ noSemanticValidation: false });
      dispatch(Act.update({ monacoTypesLoaded: true }));
    },
  ),
  ensureSyntaxWorker: createThunk(
    '[worker] ensure syntax',
    async ({ dispatch, state: { worker } }, { editorKey }: { editorKey: string }) => {
      if (!worker.syntaxWorker) {
        const syntaxWorker = redact(new SyntaxWorkerClass);
        dispatch(Act.storeSyntaxWorker({ worker: syntaxWorker }));
        await awaitWorker('worker-ready', syntaxWorker);
        await dispatch(Thunk.setupSyntaxWorker({ editorKey }));
      }
    },
  ),
  setMonacoCompilerOptions: createThunk(
    '[worker] set monaco compiler options',
    (_, { typescriptDefaults, typescript }: TypescriptDeps) => {
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
      });
    },
  ),
  /**
   * Source https://github.com/rekit/rekit-studio/blob/master/src/features/editor/setupSyntaxWorker.js
   */
  setupSyntaxWorker: createThunk(
    '[worker] setup syntax',
    async ({ state: { worker }, dispatch }, { editorKey }: { editorKey: string }) => {
      worker.syntaxWorker!.addEventListener('message', ({ data }) => {
        switch (data.key) {
          case 'send-highlights': {
            if (data.editorKey !== editorKey) return;
            requestAnimationFrame(() => {
              dispatch(Thunk.updateEditorDecorations({ editorKey, classifications: data.classifications }));
            });
            break;
          }
        }
      });
      const syntaxHighlight = () => dispatch(Thunk.syntaxHighlight({ editorKey }));
      const { editor } = worker.monacoEditor[editorKey];
      editor.onDidChangeModelContent(syntaxHighlight);
      editor.onDidChangeModel(syntaxHighlight);
      requestAnimationFrame(syntaxHighlight); // For first time load
    },
  ),
  /**
   * TODO only highlight when syntax correct?
   */
  syntaxHighlight: createThunk(
    '[worker] syntax highlight',
    ({ state: { worker } }, { editorKey }: { editorKey: string }) => {
      const { editor } = worker.monacoEditor[editorKey];
      if (!editor.getModel()) {
        return;
      }
      if (/typescript|javascript/i.test(editor.getModel()!.getModeId())) {
        worker.syntaxWorker!.postMessage({
          key: 'request-highlights',
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
      const decorations = classifications.map(classification => ({
        range: new worker.monacoRange!(
          classification.startLine,
          classification.start,
          classification.endLine,
          classification.end
        ),
        options: {
          inlineClassName: classification.kind,
        },
      }));
      // console.log({ decorations });
      const nextDecorations = editor.deltaDecorations(lastDecorations, decorations);
      dispatch(Act.updateEditor(editorKey, { lastDecorations: nextDecorations }));
    },
  ),
};

export type Thunk = ActionsUnion<typeof Thunk>;

export const reducer = (state = initialState, act: Action): State => {
  switch (act.type) {
    case '[worker] store syntax': return { ...state,
      syntaxWorker: act.pay.worker,
    };
    case '[worker] store monaco editor': return { ...state,
      monacoEditor: addToLookup({
        key: act.pay.editorKey,
        editor: act.pay.editor,
        lastDecorations: [],
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
    case '[worker] update': return { ...state,
      ...act.pay.updates,
    };
    case '[worker] update editor': return { ...state,
      monacoEditor: updateLookup(act.pay.editorKey, state.monacoEditor, () => ({ ...act.pay.updates })),
    };
    default: return state || testNever(act);
  }
};
