/**
 * Level components in main thread.
 * Concerning instances, we only store ui-related state.
 */
import { createAct, ActionsUnion, Redacted, redact, addToLookup, removeFromLookup, updateLookup } from '@model/redux.model';
import { LevelWorker, awaitWorker } from '@model/level/level.worker.model';
import { createThunk } from '@model/root.redux.model';

import LevelWorkerClass from '@worker/level/level.worker';
import { LevelUiState, createLevelUiState } from '@model/level/level.model';
import { KeyedLookup, testNever } from '@model/generic.model';
import { LevelMetaGroupUi, syncMetaGroupUi, LevelMetaGroup } from '@model/level/level-meta.model';

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
  syncMetaUi: (uid: string, metas: LevelMetaGroup[]) =>
    createAct('[Level] sync meta ui', { uid, metas }),
  updateMetaUi: (uid: string, key: string, updates: Partial<LevelMetaGroupUi>) =>
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
  moveMetaToMouse: createThunk(
    '[Level] move meta to mouse',
    ({ state: { level } }, { uid, metaGroupKey }: { uid: string; metaGroupKey: string }) => {
      const { worker, instance: { [uid]: state } } = level;
      state && worker?.postMessage({
        key: 'update-level-meta',
        levelUid: uid,
        metaGroupKey,
        update: { key: 'set-position', position: {
          x: Math.round(state.mouseWorld.x), // Snapped to nearest integers
          y: Math.round(state.mouseWorld.y),
        }}
      });
    },
  ),
  getLevel: createThunk(
    '[Level] get level',
    ({ state: { level: { instance } } }, { levelUid }: { levelUid: string }) =>
      instance[levelUid] || null, 
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
    case '[Level] sync meta ui': return { ...state,
      instance: updateLookup(act.pay.uid, state.instance, ({ metaGroupUi }) => ({
        metaGroupUi: act.pay.metas.reduce((agg, meta) => ({ ...agg,
          [meta.key]: syncMetaGroupUi(meta, metaGroupUi[meta.key]),
        }), {}),
      })),
    };
    case '[Level] update meta ui': return { ...state,
      instance: updateLookup(act.pay.uid, state.instance, ({ metaGroupUi }) =>
        ({ metaGroupUi: updateLookup(act.pay.key, metaGroupUi, () => act.pay.updates) })
      ),
    };
    default: return state || testNever(act);
  }
};
