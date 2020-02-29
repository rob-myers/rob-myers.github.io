import { createAct, ActionsUnion, addToLookup, removeFromLookup, Redacted, redact } from '../model/redux.model';
import { KeyedLookup } from '@model/generic.model';
import { XTermState, createXTermState, computeXtermKey } from '@model/xterm/xterm.model';
import { createThunk } from '@model/root.redux.model';
import { OsWorker, listenUntil } from '@model/os/os.worker.model';

import OsWorkerClass from '@worker/os/os.worker';
import { TtyXterm } from './inode/tty.xterm';
import { Terminal } from 'xterm';

export interface State {
  instance: KeyedLookup<XTermState>;
  worker: null | Redacted<OsWorker>;
  ready: boolean;
}

const initialState: State = {
  instance: {},
  worker: null,
  ready: false,
};

export const Act = {
  registerInstance: (def: XTermState) =>
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
        const worker = new OsWorkerClass();
        dispatch(Act.setupXterms(redact(worker)));
      }
    },
  ),
  createSession: createThunk(
    '[xterm] create session',
    (
      { dispatch, getState },
      { uiKey, userKey, xterm, onCreate }: {
        uiKey: string;
        userKey: string;
        xterm: Redacted<Terminal>;
        onCreate: (sessionKey: string) => void;
      }
    ) => {
      dispatch(Thunk.ensureGlobalSetup({}));
      // Create session in os worker
      const worker = getState().xterm.worker!;
      worker.postMessage({ key: 'create-session', uiKey, userKey });

      listenUntil(worker, (msg) => {
        if (msg.key === 'created-session' && msg.uiKey === uiKey) {
          // Create TtyXterm and register
          const { sessionKey } = msg;
          const ttyXterm = new TtyXterm({
            canonicalPath: msg.canonicalPath,
            sessionKey,
            linesPerUpdate: 100,
            refreshMs: 10,
            osWorker: worker,
            uiKey,
            xterm,
          });
          dispatch(Act.registerInstance({
            key: computeXtermKey(uiKey, sessionKey),
            sessionKey,
            ttyXterm,
            uiKey,
            userKey,
          }));
          onCreate(sessionKey); // Inform Session component
          return true;
        }
      });
    },
  ),
  endSession: createThunk(
    '[xterm] end session',
    ({ dispatch, state: { xterm: { instance } }  }, { xtermKey }: { xtermKey: string }) => {
      const state = instance[xtermKey];
      if (state) {
        state.ttyXterm.dispose();
        dispatch(Act.unregisterInstance(state.key));
      }
    },
  ),
};

export type Thunk = ActionsUnion<typeof Thunk>;

export const reducer = (state = initialState, act: Action): State => {
  switch (act.type) {
    case '[xterm] register': return { ...state,
      instance: addToLookup(createXTermState(act.pay), state.instance),
    };
    case '[xterm] setup': return { ...state,
      worker: act.pay.webWorker,
      ready: true,
    };
    case '[xterm] unregister': return { ...state,
      instance: removeFromLookup(act.pay.key, state.instance),
    };
    default: return state;
  }
};
