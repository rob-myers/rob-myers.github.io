import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as monaco from 'monaco-editor';
import { getWindow } from '@model/dom.model';
import { createAct, ActionsUnion, Redacted, redact } from '@model/redux.model';
import { createThunk } from '@model/root.redux.model';
import { SyntaxWorker, awaitWorker } from '@worker/syntax/worker.model';
import SyntaxWorkerClass from '@worker/syntax/syntax.worker';
import { IPackageGroup, TypescriptDeps, TsDefaults } from '@model/monaco';
import { loadTypes } from '@model/monaco/load-types';

type Editor = monaco.editor.IStandaloneCodeEditor;

export interface State {
  syntaxWorker: null | Redacted<SyntaxWorker>;
  monacoEditor: null | Redacted<Editor>;
  monacoGlobalsLoaded: boolean;
  monacoTypesLoaded: boolean;
  monacoSupportedPkgs: IPackageGroup[];
}

const initialState: State = {
  syntaxWorker: null,
  monacoEditor: null,
  monacoGlobalsLoaded: false,
  monacoTypesLoaded: false,
  monacoSupportedPkgs: [],
};

export const Act = {
  storeSyntaxWorker: ({ worker }: { worker: Redacted<SyntaxWorker> }) =>
    createAct('[worker] store syntax', { worker }),
  storeMonacoEditor: ({ editor }: { editor: Redacted<Editor> }) =>
    createAct('[worker] store monaco', { editor }),
  update: (updates: Partial<State>) =>
    createAct('[worker] update', { updates }),
};

export type Action = ActionsUnion<typeof Act>;

export const Thunk = {
  clearMonaco: createThunk(
    '[worker] clear monaco',
    ({ dispatch, state }) => {
      if (state.worker.monacoEditor) {
        dispatch(Act.update({ monacoEditor: null }));
      }
    },
  ),
  ensureMonaco: createThunk(
    '[worker] ensure monaco',
    async ({ dispatch, state }, {
      editor,
      typescript,
      typescriptDefaults,
    }: TypescriptDeps & { editor: Redacted<Editor> }) => {
      if (!state.worker.monacoEditor) {
        dispatch(Thunk.setMonacoCompilerOptions({ typescript, typescriptDefaults }));
        await dispatch(Act.storeMonacoEditor({ editor }));
        await dispatch(Thunk.ensureMonacoGlobals({}));
        await dispatch(Thunk.ensureMonacoTypes({ typescriptDefaults }));
      }
    },
  ),
  ensureMonacoGlobals: createThunk(
    '[worker] ensure monaco globals',
    async ({ state: { worker }, dispatch }) => {
      const win = getWindow();
      if (win) {
        !win.React && (win.React = React);
        !win.ReactDOM && (win.ReactDOM = ReactDOM);
        /**
         * NOTE supported packages currently empty. Examples at:
         * https://github.com/microsoft/fluentui/blob/master/packages/tsx-editor/src/utilities/defaultSupportedPackages.ts
         */
        await Promise.all(
          worker.monacoSupportedPkgs.map(group => {
            if (!win[group.globalName]) {
              return new Promise<any>(resolve => {
                // handle either promise or callback function
                const globalResult = group.loadGlobal(resolve);
                if (globalResult && (globalResult as PromiseLike<any>).then) {
                  globalResult.then(resolve);
                }
              }).then((globalModule: any) => (win[group.globalName] = globalModule));
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
      } else {
        worker.syntaxWorker.postMessage({ key: 'request-status' });
        await awaitWorker('worker-ready', worker.syntaxWorker);
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
  setupSyntaxWorker: createThunk(
    '[worker] setup syntax',
    async ({ dispatch }) => {
      await dispatch(Thunk.ensureSyntaxWorker({}));
      // ....
    },
  ),
};

export type Thunk = ActionsUnion<typeof Thunk>;

export const reducer = (state = initialState, action: Action): State => {
  switch (action.type) {
    case '[worker] store syntax': return { ...state,
      syntaxWorker: action.pay.worker,
    };
    case '[worker] store monaco': return { ...state,
      monacoEditor: action.pay.editor,
    };
    case '[worker] update': return { ...state,
      ...action.pay.updates,
    };
    default: return state;
  }
};
