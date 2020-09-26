import create from 'zustand';
import { devtools } from 'zustand/middleware'
import * as portals from 'react-reverse-portal';
import { ReplaySubject } from 'rxjs';
import Tween from '@tweenjs/tween.js';

import { KeyedLookup } from '@model/generic.model';
import { FsFile } from '@model/shell/file.model';
import * as Geom from '@model/geom/geom.model'
import { addToLookup, removeFromLookup, updateLookup } from './store.util';
import useShellStore from './shell.store';
import { NavWorker, awaitWorker } from '@nav/nav.msg';
import { Scene, Vector3 } from 'three';
import * as threeUtil from '@model/three/three.model';

export interface State {
  env: KeyedLookup<Env>;
  navWorker: null | NavWorker;
  /** Aligned to env i.e. portal node for `Env` */
  envPortal: KeyedLookup<EnvPortal>;
  /** Aligned to env i.e. actor movement manager */
  director: KeyedLookup<Director>;
  decorator: KeyedLookup<Decorator>;

  readonly api: {
    createEnv: (def: EnvDef) => void;
    /** Also use envKey as portalKey */
    ensureEnvPortal: (envKey: string) => void;
    getActorData: (envKey: string, name: string) => ActorData | null;
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
    storeScene: (envKey: string, scene: THREE.Scene) => void;
    updateNavWorkerRoom: (input: {
      envKey: string;
      roomType: string;
      roomUid: string;
      navRects: Geom.Rect[];
    }) => void;
  };
}

export interface Env {
  /** Environment key */
  key: string;
  /** Set walls very high? */
  highWalls: boolean;
  /**
   * Originally created in shell.store `Session`.
   * - world can internally write click events to builtins.
   * - builtins can write messages to change the world.
   */
  worldDevice: FsFile;
  /**
   * Messages are sent by `Room`s when they're updated.
   * This triggers shadow recomputation in `World`.
   * Navmesh recomputation is handled elsewhere i.e.
   * each `Room` talks to the nav webworker.
   */
  updateShadows$: ReplaySubject<{ key: 'room-updated' }>;
  /** Supplied by `World`. */
  scene: THREE.Scene;
}

interface EnvDef {
  envKey: string;
  highWalls: boolean;
}

interface EnvPortal {
  /** Environment key */
  key: string;
  portalNode: portals.HtmlPortalNode;
}

interface ActorData {
  name: string;
  position: Vector3;
}

/**
 * Manages actor movement for an environment.
 * We'll mutate this state per animation frame,
 * so it should not be fed into React components.
 */
interface Director {
  /** Environment key */
  key: string;
  /** Group containing actors */
  group: THREE.Group;
  /** Actor names */
  actors: string[];
  toMesh: Record<string, THREE.Mesh>;
  toTween: Record<string, null | typeof Tween['Tween']>;
  /** Can pause via cancelAnimationFrame */
  animFrameId: null | number;
}

interface Decorator {
  /** Environment key */
  key: string;
  /** Group containing indicators */
  indicators: THREE.Group;
}

let nextMsgUid = 0;

const useStore = create<State>(devtools((set, get) => ({
  env: {},
  navWorker: null,
  envPortal: {},
  director: {},
  decorator: {},

  api: {
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
          scene: new Scene(),
        }, env),
        director: addToLookup({
          key: envKey,
          group: threeUtil.placeholderGroup,
          actors: [],
          toMesh: {},
          toTween: {},
          animFrameId: null,
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

    getActorData: (envKey, name) => {
      const { group } = get().director[envKey];
      const actor = threeUtil.getChild(group, name);
      return actor
        ? { name, position: actor.position.clone() }
        : null;
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

    storeScene: (envKey, scene) => {
      set(({ env, director, decorator }) => ({
        env: updateLookup(envKey, env, () => ({ scene })),
        director: updateLookup(envKey, director, () => ({
          group: threeUtil.getChild(scene, 'actors') as THREE.Group,
        })),
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
