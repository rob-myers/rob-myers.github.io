import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as monaco from 'monaco-editor';
import { getWindow } from '@model/dom.model';
import { createAct, ActionsUnion, Redacted, redact, addToLookup, removeFromLookup } from '@model/redux.model';
import { createThunk } from '@model/root.redux.model';
import { SyntaxWorker, awaitWorker } from '@worker/syntax/worker.model';
import SyntaxWorkerClass from '@worker/syntax/syntax.worker';
import { IPackageGroup, TypescriptDeps, TsDefaults, SUPPORTED_PACKAGES, IMonacoTextModel } from '@model/monaco';
import { loadTypes } from '@model/monaco/load-types';
import { KeyedLookup, testNever } from '@model/generic.model';

type Editor = monaco.editor.IStandaloneCodeEditor;

interface MonacoEditorInstance {
  key: string;
  editor: Redacted<Editor>;
}

interface MonacoModelInstance {
  key: string;
  editorKey: string | null;
  model: Redacted<IMonacoTextModel>;
  filename: string;
}

export interface State {
  syntaxWorker: null | Redacted<SyntaxWorker>;
  monacoGlobalsLoaded: boolean;
  monacoTypesLoaded: boolean;
  monacoSupportedPkgs: IPackageGroup[];
  monacoEditor: KeyedLookup<MonacoEditorInstance>;
  monacoModel: KeyedLookup<MonacoModelInstance>;
}

const initialState: State = {
  syntaxWorker: null,
  monacoGlobalsLoaded: false,
  monacoTypesLoaded: false,
  monacoSupportedPkgs: SUPPORTED_PACKAGES,
  monacoEditor: {},
  monacoModel: {},
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
      model,
      modelKey,
      filename,
    }: TypescriptDeps & {
      editor: Redacted<Editor>;
      editorKey: string;
      modelKey: string;
      model: Redacted<IMonacoTextModel>;
      filename: string;
    }) => {
      if (!worker.monacoTypesLoaded) {
        dispatch(Thunk.setMonacoCompilerOptions({ typescript, typescriptDefaults }));
      }
      dispatch(Act.storeMonacoEditor({ editor, editorKey }));
      dispatch(Act.storeMonacoModel({ model, modelKey, editorKey, filename }));
      if (!worker.monacoTypesLoaded) {
        await dispatch(Thunk.ensureMonacoGlobals({}));
        await dispatch(Thunk.ensureMonacoTypes({ typescriptDefaults }));
      }
      await dispatch(Thunk.ensureSyntaxWorker({}));
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
    async ({ state: { worker }, dispatch }, { typescriptDefaults }: TsDefaults) => {
      // Initially disable type checking
      typescriptDefaults.setDiagnosticsOptions({ noSemanticValidation: true });
      // Load types and then turn on full type checking
      await loadTypes(worker.monacoSupportedPkgs, { typescriptDefaults });
      typescriptDefaults.setDiagnosticsOptions({ noSemanticValidation: false });
      dispatch(Act.update({ monacoTypesLoaded: true }));
    },
  ),
  ensureSyntaxWorker: createThunk(
    '[worker] ensure syntax',
    async ({ dispatch, state: { worker } }) => {
      if (!worker.syntaxWorker) {
        const syntaxWorker = redact(new SyntaxWorkerClass);
        dispatch(Act.storeSyntaxWorker({ worker: syntaxWorker }));
        await awaitWorker('worker-ready', syntaxWorker);
        await dispatch(Thunk.setupSyntaxWorker({}));
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
        // Mix in provided options
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
    async (_) => {
      /**
       * TODO
       */
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
    default: return state || testNever(act);
  }
};
