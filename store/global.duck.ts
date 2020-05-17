import { createAct, ActionsUnion, Redacted, redact } from '../model/redux.model';
import { LevelWorker, awaitWorker } from '@model/level/level.worker.model';
import { createThunk } from '@model/root.redux.model';
import LevelWorkerClass from '@worker/level/level.worker';

type WorkerStatus = 'initial' | 'pending' | 'ready' | 'failed';

export interface State {
  levelWorker: null | Redacted<LevelWorker>;
  levelStatus: WorkerStatus;
}

const initialState: State = {
  levelWorker: null,
  levelStatus: 'initial',
};

export const Act = {
  setStatus: (status: WorkerStatus) =>
    createAct('[global] set level status', { status }),
  storeWorker: ({ worker }: { worker: Redacted<LevelWorker> }) =>
    createAct('[global] store level worker', { worker }),
};

export type Action = ActionsUnion<typeof Act>;

export const Thunk = {
  ensureGlobalSetup: createThunk(
    '[global] ensure level worker',
    async ({ dispatch, state: { global } }) => {
      if (typeof Worker === 'undefined') {
        dispatch(Act.setStatus('failed'));
      }
      switch (global.levelStatus) {
        case 'failed':
          throw Error('web worker required');
        case 'initial': {
          dispatch(Act.setStatus('pending'));
          const worker = redact(new LevelWorkerClass);
          dispatch(Act.storeWorker({ worker }));
          await awaitWorker('level-worker-ready', worker);
          dispatch(Act.setStatus('ready'));
          return worker;
        }
        case 'pending': {
          const worker = global.levelWorker!;
          await awaitWorker('level-worker-ready', worker);
          return worker;
        }
        case 'ready': {
          return global.levelWorker!;
        }
      }
    },
  ),
};

export type Thunk = ActionsUnion<typeof Thunk>;

export const reducer = (state = initialState, action: Action): State => {
  switch (action.type) {
    case '[global] set level status': return { ...state,
      levelStatus: action.pay.status,
    };
    case '[global] store level worker': return { ...state,
      levelWorker: action.pay.worker,
    };
    default: return state;
  }
};
