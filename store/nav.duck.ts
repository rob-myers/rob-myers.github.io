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
import { NavDomState, createNavDomState, traverseDom, navOutset, NavDomMeta } from '@model/nav.model';
import { Poly2 } from '@model/poly2.model';
import { Vector2 } from '@model/vec2.model';
import { NavWorker } from '@model/nav-worker.model';

export interface State {
  dom: KeyedLookup<NavDomState>;
  domMeta: KeyedLookup<NavDomMeta>;
  ready: boolean;
  webWorker: null | Redacted<NavWorker>;
}

const initialState: State = {
  dom: {},
  domMeta: {},
  ready: false,
  webWorker: null,
};

export const Act = {
  setupNav: (webWorker: Redacted<NavWorker>) =>
    createAct('[Nav] setup', { webWorker }),
  registerNavDom: (uid: string) =>
    createAct('[NavDom] register', { uid }),
  unregisterNavDom: (uid: string) =>
    createAct('[NavDom] unregister', { uid }),
  updateDomMeta: (uid: string, updates: Partial<NavDomMeta>) =>
    createAct('[NavDom] update meta', { uid, updates }),
  updateNavDom: (uid: string, updates: Partial<NavDomState>) =>
    createAct('[NavDom] generic update', { uid, updates }),
};

export type Action = ActionsUnion<typeof Act>;

export const Thunk = {
  destroyNav: createThunk(
    '[Nav] unregister',
    ({ state: { nav: { webWorker } } }) => webWorker && webWorker.terminate(),
  ),
  domUidExists: createThunk(
    '[Nav] dom uid?',
    ({ state: { nav: { dom } } }, { uid }: { uid: string }) => !!dom[uid],
  ),
  ensureGlobalSetup: createThunk(
    '[Nav] ensure setup',
    ({ dispatch, state: { nav } }) => {
      if (!nav.ready && typeof Worker !== 'undefined') {
        const navWorker: NavWorker = new Worker(
          '@worker/nav.worker.ts',
          { type: 'module' },
        );
        dispatch(Act.setupNav(redact(navWorker)));
        // webworker test
        navWorker.postMessage({ key: 'ping?' });
        navWorker.addEventListener('message', ({ data }) =>
          console.log({ navWorkerSent: data }));
      }
    },
  ),
  getJustHmr: createThunk(
    '[NavDom] get justHmr',
    ({ state: { nav: { domMeta } } }, { uid }: { uid: string }) =>
      domMeta[uid] ? domMeta[uid].justHmr : false
  ),
  updateNavigable: createThunk(
    '[NavDom] update navigable',
    ({ state: { nav }, dispatch }, { uid }: { uid: string }) => {
      
      const state = nav.dom[uid];
      const webWorker = nav.webWorker;
      if (!webWorker || !state) return;
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

      // webWorker.postMessage({
      //   key: 'nav-dom?',
      //   domUid: uid,
      //   bounds: worldBounds,
      //   polys: leafPolys,
      //   rects: leafRects,
      // });

      // Compute navigable multipolygon
      const navPolys = Poly2.cutOut([
        ...leafRects.map((rect) => rect.outset(navOutset).poly2),
        ...flatten(leafPolys.map((poly) => poly.createOutset(navOutset))),
      ], [worldBounds.poly2]);

      

      // Update state to reflect dom
      dispatch(Act.updateNavDom(uid, {
        screenBounds: redact(screenBounds),
        worldBounds: redact(screenBounds),
        navigable: navPolys.map((poly) => redact(poly)),
      }));
    },
  ),
};

export type Thunk = ActionsUnion<typeof Thunk>;

export const reducer = (state = initialState, act: Action): State => {
  switch (act.type) {
    case '[Nav] setup': return { ...state,
      webWorker: act.webWorker,
      ready: true,
    };
    case '[NavDom] register': return { ...state,
      dom: addToLookup(createNavDomState(act.uid), state.dom),
      domMeta: addToLookup({ key: act.uid, justHmr: false }, state.domMeta),
    };
    case '[NavDom] unregister': return { ...state,
      dom: removeFromLookup(act.uid, state.dom),
      domMeta: removeFromLookup(act.uid, state.domMeta),
    };
    case '[NavDom] update meta': return { ...state,
      domMeta: updateLookup(act.uid, state.domMeta, () => act.updates),
    };
    case '[NavDom] generic update': return { ...state,
      dom: updateLookup(act.uid, state.dom, () => act.updates),
    };
    default: return state;
  }
};
