import create from 'zustand';
import { devtools } from 'zustand/middleware'
import { KeyedLookup } from '@model/generic.model';
import { addToLookup, removeFromLookup, updateLookup } from './store.util';

export interface State {
  env: KeyedLookup<Environment>;
  api: {
    createEnv: (def: EnvDef) => void;
    removeEnv: (key: string) => void;
    setHighWalls: (key: string, next: boolean) => void;
  };
}

export interface Environment {
  key: string;
  highWalls: boolean;
}

interface EnvDef {
  envName: string;
  highWalls: boolean;
}

const useStore = create<State>(devtools((set, get) => ({
  env: {},
  api: {
    createEnv: ({ envName, highWalls }) => {
      set(({ env }) => ({
        env: addToLookup({ key: envName, highWalls }, env),
      }));
    },
    removeEnv: (key) => {
      set(({ env }) => ({
        env: removeFromLookup(key, env),
      }));
    },
    setHighWalls(key: string, next: boolean) {
      set(({ env }) => ({
        env: updateLookup(key, env, () => ({ highWalls: next })),
      }));
    },
  },
}), 'env'));

export function selectApi({ api }: State) {
  return api;
}

export default useStore;
