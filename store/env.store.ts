import create from 'zustand';
import { devtools } from 'zustand/middleware'
import { KeyedLookup } from '@model/generic.model';
import { addToLookup, removeFromLookup, updateLookup } from './store.util';
import useShellStore from './shell.store';
import { FsFile } from '@model/shell/file.model';

export interface State {
  env: KeyedLookup<Environment>;
  api: {
    createEnv: (def: EnvDef) => void;
    removeEnv: (envKey: string) => void;
    setHighWalls: (envKey: string, next: boolean) => void;
  };
}

export interface Environment {
  key: string;
  highWalls: boolean;
  worldDevice: FsFile;
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
        }, env),
      }));
    },
    removeEnv: (envKey) => {
      set(({ env }) => ({
        env: removeFromLookup(envKey, env),
      }));
    },
    setHighWalls: (envKey: string, next: boolean) => {
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
