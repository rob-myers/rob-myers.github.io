import create from 'zustand';
import { devtools } from 'zustand/middleware'
import { KeyedLookup } from '@model/generic.model';
import { FsFile } from '@model/shell/file.model';
import * as Geom from '@model/geom/geom.model'
import { addToLookup, removeFromLookup, updateLookup } from './store.util';
import useShellStore from './shell.store';
import { NavWorker } from '@nav/nav.msg';

export interface State {
  env: KeyedLookup<Environment>;
  navWorker: null | NavWorker;
  api: {
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

const useStore = create<State>(devtools((set, get) => ({
  env: {},
  navWorker: null,
  api: {
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
      get().navWorker!.postMessage({ key: 'update-room-nav', envKey, roomType, roomUid, navPartitions });
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
