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
  NavDomMeta,
  createNavDomMetaState,
  defaultNavOutset,
  createNavSpawnState,
} from '@model/nav.model';
import { Poly2 } from '@model/poly2.model';
import { NavWorker, navWorkerMessages, NavDomContract } from '@model/nav-worker.model';
import { traverseDom } from '@model/dom.model';
import { NavGraph } from '@model/nav-graph.model';

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
        const worker: NavWorker = new Worker('@worker/nav.worker.ts', { type: 'module' });
        dispatch(Act.setupNav(redact(worker)));

        // TESTING
        worker.postMessage({ key: 'ping?', context: 'nav-setup' });
        worker.addEventListener('message', ({ data }) => console.log({ navWorkerSent: data }));
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

      if (state.updating) {// Defer updates whilst updating
        return dispatch(Act.updateDomMeta(uid, { pendingUpdate: true }));
      }
      dispatch(Act.updateNavDom(uid, { updating: true }));

      const screenBounds = Rect2.from(root.getBoundingClientRect());
      const { x: rx, y: ry } = screenBounds;
      const worldBounds = screenBounds.clone().delta(-rx, -ry);
      const rects = [] as Rect2[];
      const spawns = [] as { elemId: string; bounds: Rect2 }[];

      dispatch(Act.updateNavDom(uid, { screenBounds, worldBounds }));

      traverseDom(root, (node) => { // Compute leaf rects
        if (!node.children.length) {
          if (!node.classList.contains('navigable')) {
            const rect =  Rect2.from(node.getBoundingClientRect());
            rects.push(rect.delta(-rx, -ry));
          } else if (node.classList.contains('nav-spawn')) {
            const rect =  Rect2.from(node.getBoundingClientRect());
            spawns.push({ elemId: node.id, bounds: rect.delta(-rx, -ry) });
          }
        }
      });

      /**
       * In web worker compute nav poly/refinement/graph.
       * All messages must be received before continuing.
       */
      let navigable = [] as Redacted<Poly2>[];
      let refinedNav = [] as Redacted<Poly2>[];
      let navGraph = redact(NavGraph.from([]));

      await navWorkerMessages<NavDomContract>(worker, {
        message: {
          key: 'nav-dom?',
          bounds: worldBounds.json,
          context: uid,
          navOutset: state.navOutset || defaultNavOutset,
          rects: rects.map(({ json }) => json),
          spawns: spawns.map(({ bounds: { json } }) => json),
          debug: meta.debug,
        },
        on: {
          'nav-dom:outline!': { do: ({ navPolys }) => {
            navigable = navPolys.map(p => redact(Poly2.fromJson(p)));
          }},
          'nav-dom:refined!': { do: ({ refinedNavPolys: navPolys }) => {
            refinedNav = navPolys.map(p => redact(Poly2.fromJson(p)));
          }},
          'nav-dom:nav-graph!': { do: ({ navGraph: json}) => {
            navGraph = redact(NavGraph.fromJson(json));
          }},
        },
      });

      if (dispatch(Thunk.getDomMeta({ uid })).pendingUpdate) {
        dispatch(Act.updateDomMeta(uid, { pendingUpdate: false }));
        setTimeout(() => dispatch(Thunk.updateNavigable({ uid })));
      }
      dispatch(Act.updateNavDom(uid, {
        updating: false,
        navigable, refinedNav, navGraph,
        spawns: spawns.map(({ elemId, bounds }) =>
          createNavSpawnState({ elemId, domUid: uid, bounds }))
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
