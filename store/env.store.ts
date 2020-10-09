import create from 'zustand';
import { devtools } from 'zustand/middleware'
import * as portals from 'react-reverse-portal';
import { ReplaySubject } from 'rxjs';

import { KeyedLookup } from '@model/generic.model';
import type * as Store from '@model/env/env.store.model';
import * as Geom from '@model/geom/geom.model'
import * as threeUtil from '@model/three/three.model';
import useShellStore from './shell.store';
import { addToLookup, removeFromLookup, updateLookup } from './store.util';
import { NavWorker, awaitWorker } from '@nav/nav.msg';
import { placeholderSteerable } from '@model/env/steerable';
import { geomService } from '@model/geom/geom.service';
import { PanZoomControls } from '@model/three/controls';

export interface State {
  env: KeyedLookup<Store.Env>;
  navWorker: null | NavWorker;
  /** Aligned to env i.e. portal node for `Env` */
  envPortal: KeyedLookup<Store.EnvPortal>;
  /** Aligned to env i.e. actor movement manager */
  director: KeyedLookup<Store.Director>;
  /** Aligned to env e.g. indicators */
  decorator: KeyedLookup<Store.Decorator>;

  readonly api: {
    createActor: (envKey: string, actorName: string, position: Geom.VectorJson) => void;
    createEnv: (def: Store.EnvDef) => void;
    /** Uses envKey as portalKey */
    ensureEnvPortal: (envKey: string) => void;
    getActorMeta: (envKey: string, name: string) => Store.ActorMeta | null;
    getCamControls: (envKey: string) => PanZoomControls;
    removeActor: (envKey: string, actorName: string) => void;
    removeEnv: (envKey: string) => void;
    removeEnvPortal: (envKey: string) => void;
    removeNavWorkerRoom: (input: { envKey: string; roomType: string; roomUid: string }) => void;
    requestNavPath: (
      envKey: string,
      src: Geom.VectorJson,
      dst: Geom.VectorJson,
    ) => Promise<{ navPath: Geom.VectorJson[]; error?: string }>;
    roomUpdated: (envKey: string) => void;
    setHighWalls: (envKey: string, next: boolean) => void;
    storeCamControls: (envKey: string, controls: PanZoomControls) => void;
    storeScene: (envKey: string, scene: THREE.Scene) => void;
    updateNavWorkerRoom: (input: {
      envKey: string;
      roomType: string;
      roomUid: string;
      navRects: Geom.Rect[];
    }) => void;
  };
}


let nextMsgUid = 0;

const useStore = create<State>(devtools((set, get) => ({
  env: {},
  navWorker: null,
  envPortal: {},
  director: {},
  decorator: {},

  api: {
    createActor: (envKey, actorName, position) => {
      set(({ director }) => ({ director: updateLookup(envKey, director, ({ actor }) => ({
        actor: addToLookup({
          key: actorName,
          id: 'default-bot',
          mesh: threeUtil.placeholderMesh,
          steerable: placeholderSteerable,
          lastSpawn: geomService.toVector3(position),
          cancel: () => {},
        }, actor),
      })) }));
    },

    createEnv: ({ envKey, highWalls }) => {
      /**
       * Child's initial useEffect runs before parent's,
       * so respective session exists and contains `worldDevice`.
       * https://codesandbox.io/s/useeffect-timing-jvgip?file=/src/index.js
       */
      const { toSessionKey, session } = useShellStore.getState();
      const { worldDevice } = session[toSessionKey[envKey]];

      set(({ env, director, decorator }) => ({
        env: addToLookup({
          key: envKey,
          highWalls,
          worldDevice,
          updateShadows$: new ReplaySubject(1),
          scene: threeUtil.placeholderScene,
          camControls: {} as PanZoomControls,
        }, env),
        director: addToLookup({
          key: envKey,
          actor: {},
        }, director),
        decorator: addToLookup({
          key: envKey,
          indicators: threeUtil.placeholderGroup,
        }, decorator),
      }));

      // Also create an env in navigation webworker
      get().navWorker!.postMessage({ key: 'create-env', envKey });
    },

    ensureEnvPortal: (envKey) => {
      !get().envPortal[envKey] && set(({ envPortal }) => ({ envPortal: addToLookup({
        key: envKey,
        portalNode: portals.createHtmlPortalNode(),
      }, envPortal) }));
    },

    getActorMeta: (envKey, actorName) => {
      return get().director[envKey].actor[actorName] || null;
    },

    getCamControls: (envKey) => {
      return get().env[envKey].camControls;
    },

    removeActor: (envKey, actorName) => {
      set(({ director }) => ({
        director: updateLookup(envKey, director, ({ actor }) => ({
          actor: removeFromLookup(actorName, actor),
        })),
      }));
    },

    removeEnvPortal: (envKey) => {
      set(({ envPortal }) => ({ envPortal: removeFromLookup(envKey, envPortal) }));
    },

    removeEnv: (envKey) => {
      set(({ env, director, decorator }) => ({
        env: removeFromLookup(envKey, env),
        director: removeFromLookup(envKey, director),
        decorator: removeFromLookup(envKey, decorator),
      }));
      get().navWorker!.postMessage({ key: 'remove-env', envKey });
    },

    removeNavWorkerRoom: ({ envKey, roomType, roomUid }) => {
      get().navWorker!.postMessage({ key: 'remove-room-nav', envKey, roomType, roomUid });
    },

    requestNavPath: async (envKey, src, dst) => {
      const [msgUid, navWorker] = [`${nextMsgUid++}`, get().navWorker!];
      navWorker.postMessage({ key: 'request-navpath', envKey, msgUid, src, dst });
      const { navPath, error } = await awaitWorker('navpath-response', navWorker, ({ msgUid: other }) => msgUid === other);
      return { navPath, error };
    },

    roomUpdated: (envKey) => {
      get().env[envKey].updateShadows$.next({ key: 'room-updated' });
    },

    setHighWalls: (envKey, next) => {
      set(({ env }) => ({
        env: updateLookup(envKey, env, () => ({ highWalls: next })),
      }));
    },

    storeCamControls: (envKey, camControls) => {
      set(({ env }) => ({
        env: updateLookup(envKey, env, () => ({ camControls })),
      }));
    },

    storeScene: (envKey, scene) => {
      set(({ env, decorator }) => ({
        env: updateLookup(envKey, env, () => ({ scene })),
        decorator: updateLookup(envKey, decorator, () => ({
          indicators: threeUtil.getChild(scene, 'indicators') as THREE.Group,
        })),
      }));
    },

    updateNavWorkerRoom: ({ envKey, roomType, roomUid, navRects }) => {
      get().navWorker!.postMessage({ key: 'update-room-nav', envKey, roomType, roomUid,
        navRects: navRects.map(r => r.json),
      });
    },

  },
}), 'env'));

export function selectApi({ api }: State) {
  return api;
}

export function selectNavWorker({ navWorker }: State) {
  return navWorker;
}

// Provide direct access to api
Object.assign(useStore, { api: useStore.getState().api });

export default useStore as typeof useStore & { api: State['api'] };
