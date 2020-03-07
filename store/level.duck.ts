/**
 * This is a simple reducer which communicates with
 * the LevelWorker, which has its own more complex reducer.
 */
import { createAct, ActionsUnion, Redacted } from '@model/redux.model';
import { LevelWorker } from '@model/level/level.worker.model';
import { createThunk } from '@model/root.redux.model';

export interface State {
  worker: null | Redacted<LevelWorker>;
  ready: boolean;
}

const initialState: State = {
  worker: null,
  ready: false,
};

export const Act = {
  setReady: (ready: boolean) =>
    createAct('[Level] set ready', { ready }),
};

export type Action = ActionsUnion<typeof Act>;

export const Thunk = {
  ensureWorker: createThunk(
    '[Level] ensure worker',
    ({ state: { level: _ }}) => {
      /**
       * TODO create level worker
       */
    },
  ),
};

export type Thunk = ActionsUnion<typeof Thunk>;

export const reducer = (state = initialState, act: Action): State => {
  switch (act.type) {
    case '[Level] set ready': return { ...state,
      ready: act.pay.ready,
    };
    default: return state;
  }
};
