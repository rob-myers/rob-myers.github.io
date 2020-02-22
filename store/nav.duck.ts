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
  createNavSpawnState,
} from '@model/nav.model';
import { Poly2 } from '@model/poly2.model';
import { NavWorker, navWorkerMessages, NavDomContract } from '@model/nav-worker.model';
import { getDomAncestors } from '@model/dom.model';

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
  registerNavSpawn: (uid: string, domUid: string, worldBounds: Rect2) =>
    createAct('[NavSpawn] register', { uid, domUid, worldBounds }),
  unregisterNavSpawn: (uid: string, domUid: string) =>
    createAct('[NavSpawn] unregister', { uid, domUid }),
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
  tryRegisterSpawn: createThunk(
    '[NavSpawn] try register',
    (
      { state: { nav: { dom } }, dispatch },
      { uid, el }: { uid: string; el: Element },
    ): { navDomUid: string | null } => {
      const ancestorIds = getDomAncestors(el).map(({ id }) => id);
      const parentNavDom = Object.values(dom || {}).find(({ elemId }) =>
        ancestorIds.includes(elemId));

      if (parentNavDom) {
        const { key: navDomUid, screenBounds: { x, y } } = parentNavDom;
        const worldBounds = Rect2.from(el.getBoundingClientRect()).delta(-x, -y);
        dispatch(Act.registerNavSpawn(uid, parentNavDom.key, worldBounds));
        dispatch(Thunk.updateNavigable({ uid: navDomUid }));
        return { navDomUid };
      }
      console.error(`Failed to register NavSpawn "${uid}"`);
      return { navDomUid: null };
    },
  ),
  updateNavigable: createThunk(
    '[NavDom] update navigable',
    async ({ state: { nav }, dispatch }, { uid }: { uid: string }) => {
      
      const state = nav.dom[uid];
      const [worker, meta] = [nav.webWorker, nav.domMeta[uid]];
      if (!worker || !state) return;
      const root = document.getElementById(state.elemId);
      if (!root) return;

      if (meta.updating) {// Defer updates whilst updating
        return dispatch(Act.updateDomMeta(uid, { pendingUpdate: true }));
      }
      dispatch(Act.updateDomMeta(uid, { updating: true }));

      const screenBounds = Rect2.from(root.getBoundingClientRect());
      const { x: rx, y: ry } = screenBounds;
      const worldBounds = screenBounds.clone().delta(-rx, -ry);
      const rects = [] as Rect2[];

      dispatch(Act.updateNavDom(uid, { screenBounds, worldBounds }));

      traverseDom(root, (node) => { // Compute leaf rects
        if (!node.children.length && !node.classList.contains('navigable')) {
          const rect =  Rect2.from(node.getBoundingClientRect());
          rects.push(rect.delta(-rx, -ry));
        }
      });

      // In web worker, compute navigable poly and a refinement
      await navWorkerMessages<NavDomContract>(worker, {
        message: {
          key: 'nav-dom?',
          bounds: worldBounds.json,
          context: uid,
          navOutset: state.navOutset || defaultNavOutset,
          rects: rects.map(({ json }) => json),
          spawns: state.spawns.map(({ bounds: { json } }) => json),
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
          'nav-dom:navgraph!': { do: () => {
            // TODO
          }},
        },
      });

      if (dispatch(Thunk.getDomMeta({ uid })).pendingUpdate) {
        setTimeout(() => dispatch(Thunk.updateNavigable({ uid })));
      }
      dispatch(Act.updateDomMeta(uid, { updating: false, pendingUpdate: false }));
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
    case '[NavSpawn] register': return { ...state,
      dom: updateLookup(act.domUid, state.dom, ({ spawns }) => ({
        spawns: spawns.concat(createNavSpawnState(act.uid, act.domUid, act.worldBounds)),
      })),
    };
    case '[NavSpawn] unregister': return { ...state,
      dom: updateLookup(act.domUid, state.dom, ({ spawns }) => ({
        spawns: spawns.filter(({ key }) => key !== act.uid),
      })),
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
