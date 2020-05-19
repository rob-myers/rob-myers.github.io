import { createAct, ActionsUnion, Redacted, redact } from '../model/redux.model';
import { createThunk } from '@model/root.redux.model';
import { SyntaxWorker, awaitWorker } from '@worker/syntax/worker.model';
import SyntaxWorkerClass from '@worker/syntax/syntax.worker';

export interface State {
  syntaxWorker: null | Redacted<SyntaxWorker>;
}

const initialState: State = {
  syntaxWorker: null,
};

export const Act = {
  storeSyntaxWorker: ({ worker }: { worker: Redacted<SyntaxWorker> }) =>
    createAct('[worker] store syntax', { worker }),
};

export type Action = ActionsUnion<typeof Act>;

export const Thunk = {
  ensureGlobalSetup: createThunk(
    '[worker] ensure syntax',
    async ({ dispatch, state: { worker } }) => {
      if (!worker.syntaxWorker) {
        const worker = redact(new SyntaxWorkerClass);
        dispatch(Act.storeSyntaxWorker({ worker }));
        await awaitWorker('worker-ready', worker);
      }
    },
  ),
};

export type Thunk = ActionsUnion<typeof Thunk>;

export const reducer = (state = initialState, action: Action): State => {
  switch (action.type) {
    case '[worker] store syntax': return { ...state,
      syntaxWorker: action.pay.worker,
    };
    default: return state;
  }
};
