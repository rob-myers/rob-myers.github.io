import {
  createAct,
  createThunk,
  ActionsUnion,
  addToLookup,
  updateLookup,
  removeFromLookup,
  redact,
  Redacted,
} from './redux.model';
import { KeyedLookup, flatten } from '@model/generic.model';
import { Rect2 } from '@model/rect2.model';
import { NavDomState, createNavDomState, traverseDom, navOutset } from '@model/nav.model';
import { Poly2 } from '@model/poly2.model';
import { Vector2 } from '@model/vec2.model';

export interface State {
  dom: KeyedLookup<NavDomState>;
  webWorker: null | Redacted<Worker>;
  justHmr: boolean;
}

const initialState: State = {
  dom: {},
  webWorker: null,
  justHmr: false,
};

export const Act = {
  initializeNav: (webWorker: Redacted<Worker>) =>
    createAct('INITIALIZE_NAV', { webWorker }),
  registerNavDom: (uid: string) =>
    createAct('REGISTER_NAV_DOM', { uid }),
  unregisterNavDom: (uid: string) =>
    createAct('UNREGISTER_NAV_DOM', { uid }),
  setJustHmr: (justHmr: boolean) =>
    createAct('[nav] set justHmr', { justHmr }),
  updateNavDom: (uid: string, updates: Partial<NavDomState>) =>
    createAct('UPDATE_NAV_DOM', { uid, updates }),
};

export type Action = ActionsUnion<typeof Act>;

export const Thunk = {
  initializeNav: createThunk(
    'REGISTER_NAV_THUNK',
    ({ dispatch }) => {
      const worker = new Worker('@worker/nav.worker.ts', { type: 'module' });
      dispatch(Act.initializeNav(redact(worker)));

      // webworker test
      worker.postMessage({ fromHost: 'fromHost'});
      worker.addEventListener('message', (event: any) => console.log({ receivedFromWorker: event }));
    },
  ),
  getJustHmr: createThunk(
    '[nav] get justHmr',
    ({ state: { nav: { justHmr } } }) => justHmr,
  ),
  destroyNav: createThunk(
    'UNREGISTER_NAV_THUNK',
    ({ state: { nav: { webWorker } } }) => webWorker && webWorker.terminate(),
  ),
  updateNavigable: createThunk(
    'UPDATE_NAVIGABLE_THUNK',
    ({ state: { nav }, dispatch }, { uid }: { uid: string }) => {
      
      const state = nav.dom[uid];
      if (!state) return;
      const root = document.getElementById(state.elemId);
      if (!root) return;

      const screenBounds = Rect2.from(root.getBoundingClientRect());
      const { x: rootLeft, y: rootTop } = screenBounds;
      const worldBounds = screenBounds.clone().translate(-rootLeft, -rootTop);
      const leafRects = [] as Rect2[];
      const leafPolys = [] as Poly2[];

      // Compute rects/polys from descendents of NavDom
      traverseDom(root, (node) => {
        if (!node.children.length) {
          const rect = Rect2.from(node.getBoundingClientRect());
          rect.translate(-rootLeft, -rootTop);

          if (node instanceof SVGPolygonElement) {
            const vs = Array.from(node.points).map(p => Vector2.from(p));
            leafPolys.push(new Poly2(vs).translate(rect.x, rect.y));
          } else {
            leafRects.push(rect);
          }
        }
      });

      // Compute navigable multipolygon
      const navPolys = Poly2.cutOut([
        ...leafRects.map((rect) => rect.outset(navOutset).poly2),
        ...flatten(leafPolys.map((poly) => poly.createOutset(navOutset))),
      ], [worldBounds.poly2]);

      // Update state to reflect dom
      dispatch(Act.updateNavDom(uid, {
        screenBounds: redact(screenBounds),
        worldBounds: redact(screenBounds),
        nextUpdate: null, // Turn off throttle
        pending: false,
        navigable: navPolys.map((poly) => redact(poly)),
      }));
    },
  ),
};

export type Thunk = ActionsUnion<typeof Thunk>;

export const reducer = (state = initialState, act: Action): State => {
  switch (act.type) {
    case 'INITIALIZE_NAV': return { ...state,
      webWorker: act.webWorker,
    };
    case 'REGISTER_NAV_DOM': return { ...state,
      dom: addToLookup(createNavDomState(act.uid), state.dom),
    };
    case 'UNREGISTER_NAV_DOM': return { ...state,
      dom: removeFromLookup(act.uid, state.dom),
    };
    case '[nav] set justHmr': return { ...state,
      justHmr: act.justHmr,
    };
    case 'UPDATE_NAV_DOM': return { ...state,
      dom: updateLookup(act.uid, state.dom, () => act.updates),
    };
    default: return state;
  }
};
