import { createAct, ActionsUnion, addToLookup, removeFromLookup, Redacted, redact } from '../model/redux.model';
import { KeyedLookup } from '@model/generic.model';
import { XTermState, createXTermState, computeXtermKey } from '@model/xterm/xterm.model';
import { createThunk } from '@model/root.redux.model';
import { OsWorker, listenToWorkerUntil } from '@model/os/os.worker.model';

import OsWorkerClass from '@worker/os/os.worker';
import { TtyXterm } from '../model/xterm/tty.xterm';
import { Terminal } from 'xterm';
import { VoiceXterm } from '@model/xterm/voice.xterm';

export interface State {
  instance: KeyedLookup<XTermState>;
  worker: null | Redacted<OsWorker>;
  voice: null | VoiceXterm;
  /** Is the operating system ready in the worker? */
  ready: boolean;
}

const initialState: State = {
  instance: {},
  worker: null,
  voice: null,
  ready: false,
};

export const Act = {
  registerInstance: (def: XTermState) =>
    createAct('[xterm] register', def),
  setReady: (ready: boolean) =>
    createAct('[xterm] set ready', { ready }),
  storeWorker: ({ worker, voice }: {
    worker: Redacted<OsWorker>;
    voice: Redacted<VoiceXterm>;
  }) =>
    createAct('[xterm] store worker', { worker, voice }),
  unregisterInstance: (key: string) =>
    createAct('[xterm] unregister', { key }),
};

export type Action = ActionsUnion<typeof Act>;

export const Thunk = {
  ensureGlobalSetup: createThunk(
    '[xterm] ensure setup',
    async ({ dispatch, state: { xterm } }) => {
      if (!xterm.ready && typeof Worker !== 'undefined') {
        const worker = redact(new OsWorkerClass);
        const voice = redact(new VoiceXterm({ osWorker: worker }));
        voice.initialise();
        dispatch(Act.storeWorker({ voice, worker }));
        
        // Wait for operating system to be ready
        await new Promise<void>(resolve =>
          listenToWorkerUntil(worker, ({ data: msg }) =>
            (msg.key === 'worker-os-ready') && resolve()));
        dispatch(Act.setReady(true));
      }
    },
  ),
  createSession: createThunk(
    '[xterm] create session',
    async (
      { dispatch, getState },
      { uiKey, userKey, xterm, onCreate }: {
        uiKey: string;
        userKey: string;
        xterm: Redacted<Terminal>;
        onCreate: (sessionKey: string) => void;
      }
    ) => {
      // Wait for worker to be ready
      await dispatch(Thunk.ensureGlobalSetup({}));
      
      // Create session in os worker
      const worker = getState().xterm.worker!;
      worker.postMessage({ key: 'create-session', uiKey, userKey });

      listenToWorkerUntil(worker, ({ data: msg }) => {
        if (msg.key === 'created-session' && msg.uiKey === uiKey) {
          const { sessionKey } = msg;
          // Create TtyXterm, initialise and register
          const ttyXterm = new TtyXterm({
            canonicalPath: msg.canonicalPath,
            sessionKey,
            linesPerUpdate: 100,
            refreshMs: 1,
            osWorker: worker,
            uiKey,
            xterm,
          });
          ttyXterm.initialise();

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
  saveOs: createThunk(
    '[xterm] save operating system',
    ({ state: { xterm: { worker } } }) => {
      worker?.postMessage({ key: 'save-os' });
    },
  ),
};

export type Thunk = ActionsUnion<typeof Thunk>;

export const reducer = (state = initialState, act: Action): State => {
  switch (act.type) {
    case '[xterm] register': return { ...state,
      instance: addToLookup(createXTermState(act.pay), state.instance),
    };
    case '[xterm] set ready': return { ...state,
      ready: act.pay.ready,
    };
    case '[xterm] store worker': return { ...state,
      worker: act.pay.worker,
      voice: act.pay.voice,
    };
    case '[xterm] unregister': return { ...state,
      instance: removeFromLookup(act.pay.key, state.instance),
    };
    default: return state;
  }
};
