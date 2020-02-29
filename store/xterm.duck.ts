import { createAct, ActionsUnion, addToLookup, removeFromLookup, Redacted, redact } from '../model/redux.model';
import { KeyedLookup } from '@model/generic.model';
import { XTermState, createXTermState } from '@model/xterm/xterm.model';
import { createThunk } from '@model/root.redux.model';
import { OsWorker } from '@model/os/os.worker.model';

import OsWorkerConstructor from '@worker/os/os.worker';

export interface State {
  instance: KeyedLookup<XTermState>;
  webWorker: null | Redacted<OsWorker>;
  ready: boolean;
}

const initialState: State = {
  instance: {},
  webWorker: null,
  ready: false,
};

export const Act = {
  registerInstance: (def: { key: string; sessionKey: string }) =>
    createAct('[xterm] register', def),
  setupXterms: (webWorker: Redacted<OsWorker>) =>
    createAct('[xterm] setup', { webWorker }),
  unregisterInstance: (key: string) =>
    createAct('[xterm] unregister', { key }),
};

export type Action = ActionsUnion<typeof Act>;

export const Thunk = {
  ensureGlobalSetup: createThunk(
    '[xterm] ensure setup',
    ({ dispatch, state: { xterm } }) => {
      if (!xterm.ready && typeof Worker !== 'undefined') {
        const worker = new OsWorkerConstructor();
        dispatch(Act.setupXterms(redact(worker)));

        /**
         * TODO register inside TtyXterm
         */

      }
    },
  ),
  createSession: createThunk(
    '[xterm] create session',
    () => {
      /**
       * TODO create session
       */
    },
  ),
  destroySession: createThunk(
    '[xterm] destroy session',
    ({ state: { xterm: { instance } }  }, { sessionKey }: { sessionKey: string }) => {
      const state = instance[sessionKey];
      if (state) {
        state.xterm?.dispose();
      }
    },
  ),
};

export type Thunk = ActionsUnion<typeof Thunk>;

export const reducer = (state = initialState, act: Action): State => {
  switch (act.type) {
    case '[xterm] register': return { ...state,
      instance: addToLookup(createXTermState(act.pay.key, act.pay.sessionKey), state.instance),
    };
    case '[xterm] setup': return { ...state,
      webWorker: act.pay.webWorker,
      ready: true,
    };
    case '[xterm] unregister': return { ...state,
      instance: removeFromLookup(act.pay.key, state.instance),
    };
    default: return state;
  }
};
