import {
  createAct,
  createThunk,
  ActionsUnion,
  addToLookup,
  updateLookup,
  removeFromLookup,
  redact,
} from './redux.model';
import { KeyedLookup } from '@model/generic.model';
import { Rect2 } from '@model/rect2.model';
import { NavDomState, createNavDomState, traverseDom, navOutset } from '@components/nav-dom/nav.model';
import { Poly2 } from '@model/poly2.model';


export interface State {
  dom: KeyedLookup<NavDomState>;
}

const initialState: State = {
  dom: {},
};

export const Act = {
  registerNavDom: (uid: string) =>
    createAct('REGISTER_NAV_DOM', { uid }),
  unregisterNavDom: (uid: string) =>
    createAct('UNREGISTER_NAV_DOM', { uid }),
  setThrottle: (uid: string, nextUpdate: number | null) =>
    createAct('THROTTLE_NAV_DOM', { uid, nextUpdate }),
  updateNavDom: (uid: string, updates: Partial<NavDomState>) =>
    createAct('UPDATE_NAV_DOM', { uid, updates }),
};

export type Action = ActionsUnion<typeof Act>;

export const Thunk = {
  computeNavigable: createThunk(
    'COMPUTE_NAVIGABLE_THUNK',
    ({ state: { nav }, dispatch }, uid: string) => {
      
      const state = nav.dom[uid];
      if (!state) return;
      const root = document.getElementById(state.elemId);
      if (!root) return;

      const worldRect = Rect2.from(root.getBoundingClientRect());
      const leafRects = [] as Rect2[];
      // TODO svg polygons
      // TODO NavSpawn's are containers

      traverseDom(root, (node) => {
        if (!node.children.length) {
          leafRects.push(Rect2.from(node.getBoundingClientRect()));
        }
      });

      const navPolys = Poly2.cutOut(
        leafRects.map((rect) => rect.outset(navOutset).poly2),
        [worldRect.poly2],
      );

      dispatch(Act.updateNavDom(uid, {
        bounds: redact(worldRect),
        navPolys: navPolys.map((poly) => redact(poly)),
      }));

      dispatch(Act.setThrottle(uid, null));
    },
  ),
  updateNavigable: createThunk(
    'UPDATE_NAVIGABLE_THUNK',
    ({ dispatch, state: { nav } }, uid: string) => {
  
      const state = nav.dom[uid];
      if (!state || state.nextUpdate) {
        return; // Not found, or throttled.
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
    case 'UPDATE_NAV_DOM': return { ...state,
      dom: updateLookup(act.uid, state.dom, () => act.updates)
    };
    default: return state;
  }
};
