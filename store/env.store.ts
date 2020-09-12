import create from 'zustand';
import { devtools } from 'zustand/middleware'
import { KeyedLookup } from '@model/generic.model';
import { addToLookup, removeFromLookup, updateLookup } from './store.util';
import useShellStore from './shell.store';
import { FsFile } from '@model/shell/file.model';

export interface State {
  env: KeyedLookup<Environment>;
  room: KeyedLookup<EnvRoom>;
  api: {
    createEnv: (def: EnvDef) => void;
    removeEnv: (envKey: string) => void;
    setHighWalls: (envKey: string, next: boolean) => void;
    registerRoom: (envKey: string, roomKey: string) => void;
    unregisterRoom: (roomKey: string) => void;
    registerInner: (roomKey: string, innerKey: string) => void;
    unregisterInner: (roomKey: string, innerKey: string) => void;
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

export interface EnvRoom {
  /** Room instance key */
  key: string;
  /** Parent env */
  envKey: string;
  /** Identifiers of `Inner` children of room */
  innerKeys: string[];
}

const useStore = create<State>(devtools((set, get) => ({
  env: {},
  room: {},
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

    registerRoom: (envKey, roomKey) => {
      set(({ room }) => ({
        room: addToLookup({ key: roomKey, envKey, innerKeys: [] }, room),
      }));
    },

    unregisterRoom: (roomKey) => {
      set(({ room }) => ({
        room: removeFromLookup(roomKey, room),
      }));
    },

    registerInner: (roomKey, innerKey) => {
      set(({ room }) => ({
        room: updateLookup(roomKey, room, ({ innerKeys }) => ({
          innerKeys: innerKeys.concat(innerKey),
        })),
      }));
    },

    unregisterInner: (roomKey, innerKey) => {
      set(({ room }) => ({
        room: updateLookup(roomKey, room, ({ innerKeys }) => ({
          innerKeys: innerKeys.filter(key => key !== innerKey),
        })),
      }));
    },

  },
}), 'env'));

export function selectApi({ api }: State) {
  return api;
}

export default useStore;
