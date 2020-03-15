/**
 * Level components in main thread.
 * Concerning instances, we only store ui-related state.
 */
import { createAct, ActionsUnion, Redacted, redact, addToLookup, removeFromLookup, updateLookup } from '@model/redux.model';
import { LevelWorker, awaitWorker } from '@model/level/level.worker.model';
import { createThunk } from '@model/root.redux.model';

import LevelWorkerClass from '@worker/level/level.worker';
import { LevelUiState, createLevelUiState, createLevelPointUi } from '@model/level/level.model';
import { KeyedLookup, testNever } from '@model/generic.model';
import { LevelPointUi } from '@model/level/level-point.model';

export interface State {
  worker: null | Redacted<LevelWorker>;
  /** Status of web worker */
  status: 'initial' | 'pending' | 'ready' | 'failed';
  instance: KeyedLookup<LevelUiState>;
}

const initialState: State = {
  worker: null,
  status: 'initial',
  instance: {},
};

export const Act = {
  registerLevel: (uid: string) =>
    createAct('[Level] register level', { uid }),
  updateLevel: (uid: string, updates: Partial<LevelUiState>) =>
    createAct('[Level] update level', { uid, updates }),
  unregisterLevel: (uid: string) =>
    createAct('[Level] unregister level', { uid }),
  setStatus: (status: State['status']) =>
    createAct('[Level] set status', { status }),
  storeWorker: (worker: Redacted<LevelWorker>) =>
    createAct('[Level] store worker', { worker }),
  ensureMetaUi: (uid: string, keys: string[]) =>
    createAct('[Level] ensure meta ui', { uid, keys }),
  updateMetaUi: (uid: string, key: string, updates: Partial<LevelPointUi>) =>
    createAct('[Level] update meta ui', { uid, key, updates }),
};

export type Action = ActionsUnion<typeof Act>;

export const Thunk = {
  ensureWorker: createThunk(
    '[Level] ensure worker',
    async ({ dispatch, state: { level } }) => {
      if (typeof Worker === 'undefined') {
        dispatch(Act.setStatus('failed'));
      }
      switch (level.status) {
        case 'failed': {
          throw Error('web worker required');
        }
        case 'initial': {
          dispatch(Act.setStatus('pending'));
          const worker = new LevelWorkerClass();
          dispatch(Act.storeWorker(redact(worker)));
          await awaitWorker('level-worker-ready', worker);
          dispatch(Act.setStatus('ready'));
          return worker;
        }
        case 'pending': {
          const worker = level.worker!;
          await awaitWorker('level-worker-ready', worker);
          return worker;
        }
        case 'ready': {
          return level.worker!;
        }
      }
    },
  ),
  createLevel: createThunk(
    '[Level] create',
    async ({ dispatch }, { uid }: { uid: string }) => {
      const worker = await dispatch(Thunk.ensureWorker({}));
      worker.postMessage({ key: 'request-new-level', levelUid: uid });
      await awaitWorker('worker-created-level', worker);
      dispatch(Act.registerLevel(uid));
    },
  ),
  destroyLevel: createThunk(
    '[Level] destroy',
    async ({ dispatch }, { uid }: { uid: string }) => {
      const worker = await dispatch(Thunk.ensureWorker({}));
      worker.postMessage({ key: 'request-destroy-level', levelUid: uid });
      dispatch(Act.unregisterLevel(uid));
    },
  ),
};

export type Thunk = ActionsUnion<typeof Thunk>;

export const reducer = (state = initialState, act: Action): State => {
  switch (act.type) {
    case '[Level] register level': return { ...state,
      instance: addToLookup(createLevelUiState(act.pay.uid), state.instance),
    };
    case '[Level] update level': return { ...state,
      instance: updateLookup(act.pay.uid, state.instance, () => act.pay.updates),
    };
    case '[Level] unregister level': return { ...state,
      instance: removeFromLookup(act.pay.uid, state.instance),
    };
    case '[Level] set status': return { ...state,
      status: act.pay.status,
    };
    case '[Level] store worker': return { ...state,
      worker: act.pay.worker,
    };
    case '[Level] ensure meta ui': return { ...state,
      instance: updateLookup(act.pay.uid, state.instance, ({ metaUi }) => ({
        metaUi: act.pay.keys.reduce((agg, key) => ({ ...agg,
          [key]: metaUi[key] || createLevelPointUi(key)
        }), {}),
      })),
    };
    case '[Level] update meta ui': return { ...state,
      instance: updateLookup(act.pay.uid, state.instance, ({ metaUi }) =>
        ({ metaUi: updateLookup(act.pay.key, metaUi, () => act.pay.updates) }))
    };
    default: return state || testNever(act);
  }
};
