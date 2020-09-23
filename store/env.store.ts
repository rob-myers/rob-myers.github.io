import create from 'zustand';
import { devtools } from 'zustand/middleware'
import * as portals from 'react-reverse-portal';

import { KeyedLookup } from '@model/generic.model';
import { FsFile } from '@model/shell/file.model';
import * as Geom from '@model/geom/geom.model'
import { addToLookup, removeFromLookup, updateLookup } from './store.util';
import useShellStore from './shell.store';
import { NavWorker, awaitWorker } from '@nav/nav.msg';
import { Subscription } from 'rxjs';
import { handleWorldDeviceWrites } from '@model/shell/events.model';

export interface State {
  env: KeyedLookup<Environment>;
  navWorker: null | NavWorker;
  /** Portal nodes for mounted `Env`s */
  envPortal: KeyedLookup<EnvPortal>;
  api: {
    /** Also use envKey as portalKey */
    ensureEnvPortal: (envKey: string) => void;
    removeEnvPortal: (envKey: string) => void;
    createEnv: (def: EnvDef) => void;
    removeEnv: (envKey: string) => void;
    setHighWalls: (envKey: string, next: boolean) => void;
    removeNavWorkerRoom: (input: { envKey: string; roomType: string; roomUid: string }) => void;
    requestNavPath: (
      envKey: string,
      src: Geom.VectorJson,
      dst: Geom.VectorJson,
    ) => Promise<{ navPath: Geom.VectorJson[]; error?: string }>;
    roomUpdated: (envKey: string) => void;
    updateNavWorkerRoom: (input: {
      envKey: string;
      roomType: string;
      roomUid: string;
      navRects: Geom.Rect[];
    }) => void;
  };
}

export interface Environment {
  /** Environment key */
  key: string;
  /** Should the walls be really high? */
  highWalls: boolean;
  /**
   * Originally created in shell.store `Session`.
   * - world can internally write click events to builtins.
   * - builtins can write messages to change the world.
   */
  worldDevice: FsFile;
  /**
   * Used to trigger navmesh recomputation.
   * TODO use a Subject instead?
   */
  roomsUpdatedAt: number;
  cleanups: (() => void)[];
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

let nextMsgUid = 0;

const useStore = create<State>(devtools((set, get) => ({
  env: {},
  navWorker: null,
  envPortal: {},
  api: {
    ensureEnvPortal: (envKey) => {
      !get().envPortal[envKey] && set(({ envPortal }) => ({ envPortal: addToLookup({
        key: envKey,
        portalNode: portals.createHtmlPortalNode(),
      }, envPortal) }));
    },
    removeEnvPortal: (envKey) => {
      set(({ envPortal }) => ({ envPortal: removeFromLookup(envKey, envPortal) }));
    },
    createEnv: ({ envKey, highWalls }) => {
      /**
       * Child's initial useEffect runs before parent's,
       * so respective session exists and contains `worldDevice`.
       * https://codesandbox.io/s/useeffect-timing-jvgip?file=/src/index.js
       */
      const { toSessionKey, session } = useShellStore.getState();
      const { worldDevice } = session[toSessionKey[envKey]];
      const writeHandler = handleWorldDeviceWrites(envKey);

      set(({ env }) => ({
        env: addToLookup({
          key: envKey,
          highWalls,
          worldDevice,
          roomsUpdatedAt: Date.now(),
          cleanups: [
            worldDevice.iNode.onWrite((msg) => writeHandler(msg), false),
          ],
        }, env),
      }));

      // Also create an env in navigation webworker
      get().navWorker!.postMessage({ key: 'create-env', envKey });
    },
    
    removeEnv: (envKey) => {
      set(({ env }) => {
        env[envKey]?.cleanups.forEach(cleanup => cleanup());
        return { env: removeFromLookup(envKey, env) };
      });
      
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
      set(({ env }) => ({
        env: updateLookup(envKey, env, () => ({
          roomsUpdatedAt: Date.now(),
        })),
      }));
    },

    setHighWalls: (envKey, next) => {
      set(({ env }) => ({
        env: updateLookup(envKey, env, () => ({ highWalls: next })),
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

export default useStore;
