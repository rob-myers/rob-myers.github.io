import create from 'zustand';
import { devtools } from 'zustand/middleware'
import { KeyedLookup } from '@model/generic.model';
import { addToLookup, removeFromLookup, updateLookup } from './store.util';
import useShellStore from './shell.store';
import { FsFile, mockFsFile } from '@model/shell/file.model';

export interface State {
  env: KeyedLookup<Environment>;
  api: {
    createEnv: (def: EnvDef) => void;
    removeEnv: (envKey: string) => void;
    connectToWorldDevice: (envKey: string) => void;
    setHighWalls: (envKey: string, next: boolean) => void;
  };
}

export interface Environment {
  key: string;
  highWalls: boolean;
  device: FsFile;
}

interface EnvDef {
  envKey: string;
  highWalls: boolean;
}

const useStore = create<State>(devtools((set, get) => ({
  env: {},
  api: {
    createEnv: ({ envKey, highWalls }) => {
      set(({ env }) => ({
        env: addToLookup({
          key: envKey,
          highWalls,
          device: mockFsFile, // Will be overwritten
        }, env),
      }));
    },
    connectToWorldDevice: (envKey: string) => {
      const { toSessionKey, session, fs } = useShellStore.getState();
      const absPath = `/dev/world-${session[toSessionKey[envKey]].ttyId}`;
      const device = fs[absPath];
      set(({ env }) => updateLookup(envKey, env, () => ({ device })));
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
