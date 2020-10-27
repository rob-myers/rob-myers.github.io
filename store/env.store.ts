import create from 'zustand';
import { devtools } from 'zustand/middleware'
import * as portals from 'react-reverse-portal';

import { KeyedLookup } from '@model/generic.model';
import type * as Store from '@model/env/env.store.model';
import useShellStore from './shell.store';
import { addToLookup, removeFromLookup } from './store.util';

export interface State {
  env: KeyedLookup<Store.Env>;
  /** Aligned to env i.e. portal node for `Env` */
  envPortal: KeyedLookup<Store.EnvPortal>;

  readonly api: {
    createEnv: (def: Store.EnvDef) => void;
    /** Uses envKey as portalKey */
    ensureEnvPortal: (envKey: string) => void;
    removeEnv: (envKey: string) => void;
    removeEnvPortal: (envKey: string) => void;
  };
}

const useStore = create<State>(devtools((set, get) => ({
  env: {},
  envPortal: {},

  api: {
    createEnv: ({ envKey }) => {
      /**
       * Child's initial useEffect runs before parent's,
       * so respective session exists and contains `worldDevice`.
       * https://codesandbox.io/s/useeffect-timing-jvgip?file=/src/index.js
       */
      const { toSessionKey, session } = useShellStore.getState();
      const { worldDevice } = session[toSessionKey[envKey]];

      set(({ env }) => ({
        env: addToLookup({
          key: envKey,
          worldDevice,
        }, env),
      }));
    },

    ensureEnvPortal: (envKey) => {
      !get().envPortal[envKey] && set(({ envPortal }) => ({ envPortal: addToLookup({
        key: envKey,
        portalNode: portals.createHtmlPortalNode(),
      }, envPortal) }));
    },

    removeEnvPortal: (envKey) => {
      set(({ envPortal }) => ({ envPortal: removeFromLookup(envKey, envPortal) }));
    },

    removeEnv: (envKey) => {
      set(({ env }) => ({
        env: removeFromLookup(envKey, env),
      }));
    },

  },
}), 'env'));

export function selectApi({ api }: State) {
  return api;
}

// Provide direct access to api
Object.assign(useStore, { api: useStore.getState().api });

export default useStore as typeof useStore & { api: State['api'] };
