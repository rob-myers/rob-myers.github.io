import create from 'zustand';
import { devtools } from 'zustand/middleware'
import { KeyedLookup } from '@model/generic.model';
import { FsFile } from '@model/shell/file.model';
import * as Geom from '@model/geom/geom.model'
import { addToLookup, removeFromLookup, updateLookup } from './store.util';
import useShellStore from './shell.store';
import useGeomStore from './geom.store';

export interface State {
  env: KeyedLookup<Environment>;
  api: {
    createEnv: (def: EnvDef) => void;
    removeEnv: (envKey: string) => void;
    setHighWalls: (envKey: string, next: boolean) => void;
    removeNavWorkerRoom: (input: { envKey: string, roomUid: string }) => void;
    roomUpdated: (envKey: string) => void;
    updateNavWorkerRoom: (input: { envKey: string; roomUid: string;  navPartitions: Geom.Rect[][]; }) => void;
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
    },
    
    removeEnv: (envKey) => {
      set(({ env }) => ({
        env: removeFromLookup(envKey, env),
      }));
    },

    removeNavWorkerRoom: ({ envKey, roomUid }) => {
      const { navWorker } = useGeomStore.getState();
      navWorker!.postMessage({ key: 'remove-room-nav', envKey, roomUid });
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

    updateNavWorkerRoom: ({ envKey, roomUid, navPartitions }) => {
      const { navWorker } = useGeomStore.getState();
      navWorker!.postMessage({ key: 'update-room-nav', envKey, roomUid, navPartitions });
    },

  },
}), 'env'));

export function selectApi({ api }: State) {
  return api;
}

export default useStore;
