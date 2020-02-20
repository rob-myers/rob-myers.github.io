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
import { KeyedLookup } from '@model/generic.model';
import { Rect2 } from '@model/rect2.model';
import {
  NavDomState,
  createNavDomState,
  traverseDom,
  NavDomMeta,
  createNavDomMetaState,
  defaultNavOutset,
} from '@model/nav.model';
import { Poly2 } from '@model/poly2.model';
import { NavWorker, navWorkerMessages, NavDomContract } from '@model/nav-worker.model';

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
  // destroyNav: createThunk(
  //   '[Nav] unregister',
  //   ({ state: { nav: { webWorker } } }) => webWorker && webWorker.terminate(),
  // ),
  domUidExists: createThunk(
    '[Nav] dom uid?',
    ({ state: { nav: { dom } } }, { uid }: { uid: string }) => !!dom[uid],
  ),
  ensureGlobalSetup: createThunk(
    '[Nav] ensure setup',
    ({ dispatch, state: { nav } }) => {
      if (!nav.ready && typeof Worker !== 'undefined') {
        const worker: NavWorker = new Worker(
          '@worker/nav.worker.ts',
          { type: 'module' },
        );
        dispatch(Act.setupNav(redact(worker)));
        // testing
        worker.postMessage({ key: 'ping?', context: 'nav-setup' });
        worker.addEventListener('message', ({ data }) =>
          console.log({ navWorkerSent: data }));
      }
    },
  ),
  getDomMeta: createThunk(
    '[NavDom] get meta',
    ({ state: { nav: { domMeta } } }, { uid }: { uid: string }) => domMeta[uid] || {}
  ),
  updateNavigable: createThunk(
    '[NavDom] update navigable',
    async ({ state: { nav }, dispatch }, { uid }: { uid: string }) => {
      
      const state = nav.dom[uid];
      const [worker, meta] = [nav.webWorker, nav.domMeta[uid]];
      if (!worker || !state) return;
      const root = document.getElementById(state.elemId);
      if (!root) return;

      if (meta.updating) return; // Currently ignore requests while updating.
      dispatch(Act.updateDomMeta(uid, { updating: true }));

      const screenBounds = Rect2.from(root.getBoundingClientRect());
      const { x: rx, y: ry } = screenBounds;
      const worldBounds = screenBounds.clone().delta(-rx, -ry);
      const rects = [] as Rect2[];
      
      // Compute leaf rects
      traverseDom(root, (node) => {
        if (!node.children.length && !node.classList.contains('navigable')) {
          const rect =  Rect2.from(node.getBoundingClientRect());
          rects.push(rect.delta(-rx, -ry));
        }
      });

      // In web worker, compute navigable poly and a refinement
      await navWorkerMessages<NavDomContract>(worker, {
        message: {
          key: 'nav-dom?',
          context: uid,
          bounds: worldBounds.json,
          rects: rects.map(({ json }) => json),
          navOutset: state.navOutset || defaultNavOutset,
        },
        on: {
          'nav-dom:outline!': { do: ({ navPolys }) => {
            const navigable = navPolys.map(p => redact(Poly2.fromJson(p)));
            dispatch(Act.updateNavDom(uid, { navigable }));
          }},
          'nav-dom:refined!': { do: ({ refinedNavPolys: navPolys }) => {
            const refinedNav = navPolys.map(p => redact(Poly2.fromJson(p)));
            dispatch(Act.updateNavDom(uid, { refinedNav }));
          }},
        },
      });

      dispatch(Act.updateNavDom(uid, { worldBounds: redact(worldBounds) }));
      dispatch(Act.updateDomMeta(uid, { updating: false }));
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
      domMeta: addToLookup(createNavDomMetaState(act.uid), state.domMeta),
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
