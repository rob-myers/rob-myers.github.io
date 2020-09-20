import create from 'zustand';
import { devtools } from 'zustand/middleware'
import * as portals from 'react-reverse-portal';

import { KeyedLookup } from '@model/generic.model';
import { FsFile } from '@model/shell/file.model';
import * as Geom from '@model/geom/geom.model'
import { addToLookup, removeFromLookup, updateLookup } from './store.util';
import useShellStore from './shell.store';
import { NavWorker } from '@nav/nav.msg';

export interface State {
  env: KeyedLookup<Environment>;
  navWorker: null | NavWorker;
  envPortal: KeyedLookup<EnvPortal>;
  api: {
    /** Also use envKey as portalKey */
    ensureEnvPortal: (envKey: string) => void;
    removeEnvPortal: (envKey: string) => void;
    createEnv: (def: EnvDef) => void;
    removeEnv: (envKey: string) => void;
    setHighWalls: (envKey: string, next: boolean) => void;
    removeNavWorkerRoom: (input: { envKey: string; roomType: string; roomUid: string }) => void;
    roomUpdated: (envKey: string) => void;
    updateNavWorkerRoom: (input: {
      envKey: string;
      roomType: string;
      roomUid: string;
      navPartitions: Geom.Rect[][];
    }) => void;
  };
}

export interface Environment {
  key: string;
  highWalls: boolean;
  worldDevice: FsFile;
  roomsUpdatedAt: number;
}

interface EnvDef {
  envKey: string;
  highWalls: boolean;
}

interface EnvPortal {
  key: string;
  portalNode: portals.HtmlPortalNode;
}

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
       * so we know the respective session exists.
       * https://codesandbox.io/s/useeffect-timing-jvgip?file=/src/index.js
       */
      const { toSessionKey, session } = useShellStore.getState();
      const { worldDevice } = session[toSessionKey[envKey]];

      set(({ env }) => ({
        env: addToLookup({
          key: envKey,
          highWalls,
          worldDevice,
          roomsUpdatedAt: Date.now(),
        }, env),
      }));


      get().navWorker!.postMessage({ key: 'create-env', envKey });
    },
    
    removeEnv: (envKey) => {
      set(({ env }) => ({
        env: removeFromLookup(envKey, env),
      }));
      
      get().navWorker!.postMessage({ key: 'remove-env', envKey });
    },

    removeNavWorkerRoom: ({ envKey, roomType, roomUid }) => {
      get().navWorker!.postMessage({ key: 'remove-room-nav', envKey, roomType, roomUid });
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

    updateNavWorkerRoom: ({ envKey, roomType, roomUid, navPartitions }) => {
      get().navWorker!.postMessage({ key: 'update-room-nav', envKey, roomType, roomUid,
        navPartitions: navPartitions.map(rects => rects.map(r => r.json)),
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
