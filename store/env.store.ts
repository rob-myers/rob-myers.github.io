import create from 'zustand';
import { devtools } from 'zustand/middleware'
import { KeyedLookup } from '@model/generic.model';
import { FsFile } from '@model/shell/file.model';
import { addToLookup, removeFromLookup, updateLookup } from './store.util';
import useShellStore from './shell.store';

export interface State {
  env: KeyedLookup<Environment>;
  api: {
    createEnv: (def: EnvDef) => void;
    removeEnv: (envKey: string) => void;
    setHighWalls: (envKey: string, next: boolean) => void;
    roomUpdated: (envKey: string) => void;
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

  },
}), 'env'));

export function selectApi({ api }: State) {
  return api;
}

export default useStore;
