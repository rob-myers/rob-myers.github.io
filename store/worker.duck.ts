import { createAct, ActionsUnion, Redacted, redact } from '../model/redux.model';
import { createThunk } from '@model/root.redux.model';
import { SyntaxWorker, awaitWorker } from '@worker/syntax/worker.model';
import SyntaxWorkerClass from '@worker/syntax/syntax.worker';
import * as monaco from 'monaco-editor';

type Editor = monaco.editor.IStandaloneCodeEditor;

export interface State {
  syntaxWorker: null | Redacted<SyntaxWorker>;
  monacoEditor: null | Redacted<Editor>;
}

const initialState: State = {
  syntaxWorker: null,
  monacoEditor: null,
};

export const Act = {
  storeSyntaxWorker: ({ worker }: { worker: Redacted<SyntaxWorker> }) =>
    createAct('[worker] store syntax', { worker }),
  storeMonacoEditor: ({ editor }: { editor: Redacted<Editor> }) =>
    createAct('[worker] store monaco', { editor }),
    
};

export type Action = ActionsUnion<typeof Act>;

export const Thunk = {
  ensureMonacoEditor: createThunk(
    '[worker] ensure monaco',
    ({ dispatch, state }, { editor }: { editor: Redacted<Editor>  }) => {
      if (!state.worker.monacoEditor) {
        dispatch(Act.storeMonacoEditor({ editor }));
        // TODO initial setup?
      }
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
    default: return state;
  }
};
