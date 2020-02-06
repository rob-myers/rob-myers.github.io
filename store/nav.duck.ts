import {
  createAct,
  createThunk,
  ActionsUnion,
  addToLookup,
  updateLookup,
  removeFromLookup,
  RedactInReduxDevTools,
} from './redux-util';
import { KeyedLookup } from '@custom-types/generic.model';
import { Rect2 } from '@custom-types/rect2.model';


export interface State {
  dom: KeyedLookup<NavDomState>;
}
interface NavDomState {
  /** uid. */
  key: string;
  /** For throttling (epoch ms). */
  nextUpdate: null | number;
  spawns: NavSpawnState[];
}

interface NavSpawnState {
  key: string;
  bounds: Rect2 & RedactInReduxDevTools;
}

const initialState: State = {
  dom: {},
};
function createNavDomState(uid: string): NavDomState {
  return {
    key: uid,
    nextUpdate: null,
    spawns: [],
  };
}

export const Act = {
  registerNavDom: (uid: string) =>
    createAct('REGISTER_NAV_DOM', { uid }),
  unregisterNavDom: (uid: string) =>
    createAct('UNREGISTER_NAV_DOM', { uid }),
  setThrottle: (uid: string, nextUpdate: number) =>
    createAct('THROTTLE_NAV_DOM', { uid, nextUpdate }),
};

export type Action = ActionsUnion<typeof Act>;

export const Thunk = {
  computeNavigable: createThunk(
    'COMPUTE_NAVIGABLE_THUNK',
    (_, _uid: string) => {
      // ...
    },
  ),
  updateNavigable: createThunk(
    'UPDATE_NAVIGABLE_THUNK',
    ({ dispatch, getState }, uid: string) => {
  
      const state = getState().nav.dom[uid];
      if (!state || state.nextUpdate) {
        return; // Not found or throttled.
      }
  
      const waitMs = 100;
      dispatch(Act.setThrottle(uid, Date.now() + waitMs));
      window.setTimeout(() => dispatch(Thunk.computeNavigable(uid)), waitMs);
    },
  )
};

export type Thunk = ActionsUnion<typeof Thunk>;

export const reducer = (state = initialState, act: Action): State => {
  switch (act.type) {
    case 'REGISTER_NAV_DOM': return { ...state,
      dom: addToLookup(createNavDomState(act.uid), state.dom)
    };
    case 'UNREGISTER_NAV_DOM': return { ...state,
      dom: removeFromLookup(act.uid, state.dom)
    };
    case 'THROTTLE_NAV_DOM': return { ...state,
      dom: updateLookup(act.uid, state.dom, () => ({ nextUpdate: act.nextUpdate }))
    };
    default: return state;
  }
};
