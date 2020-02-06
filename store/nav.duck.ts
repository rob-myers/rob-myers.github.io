import {
  createAct,
  createThunk,
  ActionsUnion,
  addToLookup,
  updateLookup,
  removeFromLookup,
  RedactInReduxDevTools,
  redact,
} from './redux-util';
import { KeyedLookup } from '@model/generic.model';
import { Rect2 } from '@model/rect2.model';
import { getNavElemId, traverseDom } from '@components/nav-dom/nav-util';


export interface State {
  dom: KeyedLookup<NavDomState>;
}
interface NavDomState {
  /** uid. */
  key: string;
  rootKey: string;
  bounds: Rect2 & RedactInReduxDevTools;
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
    rootKey: getNavElemId(uid, 'root'),
    bounds: redact(Rect2.from(), 'Rect2'),
    nextUpdate: null,
    spawns: [],
  };
}

export const Act = {
  registerNavDom: (uid: string) =>
    createAct('REGISTER_NAV_DOM', { uid }),
  unregisterNavDom: (uid: string) =>
    createAct('UNREGISTER_NAV_DOM', { uid }),
  setThrottle: (uid: string, nextUpdate: number | null) =>
    createAct('THROTTLE_NAV_DOM', { uid, nextUpdate }),
};

export type Action = ActionsUnion<typeof Act>;

export const Thunk = {
  computeNavigable: createThunk(
    'COMPUTE_NAVIGABLE_THUNK',
    ({ getState, dispatch }, uid: string) => {

      const state = getState().nav.dom[uid];
      if (!state) return;
      const root = document.getElementById(state.rootKey);
      if (!root) return;

      traverseDom(root, (node) => {
        if (!node.children.length) {
          console.log({ child: node });
        }
      });

      dispatch(Act.setThrottle(uid, null));
    },
  ),
  updateNavigable: createThunk(
    'UPDATE_NAVIGABLE_THUNK',
    ({ dispatch, getState }, uid: string) => {
  
      const state = getState().nav.dom[uid];
      // Exists and not throttled?
      if (!state || state.nextUpdate) return;
  
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
