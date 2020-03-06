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
  initialSetup: ({ worker, voice }: {
    worker: Redacted<OsWorker>;
    voice: Redacted<VoiceXterm>;
  }) =>
    createAct('[xterm] setup', { worker, voice }),
  unregisterInstance: (key: string) =>
    createAct('[xterm] unregister', { key }),
};

export type Action = ActionsUnion<typeof Act>;

export const Thunk = {
  ensureGlobalSetup: createThunk(
    '[xterm] ensure setup',
    ({ dispatch, state: { xterm } }) => {
      if (!xterm.ready && typeof Worker !== 'undefined') {
        const worker = redact(new OsWorkerClass);
        const voice = redact(new VoiceXterm({
          // defaultVoice: 'Alex',
          osWorker: worker,
        }));
        voice.initialise();
        dispatch(Act.initialSetup({ voice, worker }));
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

      listenToWorkerUntil(worker, ({ data: msg }) => {
        if (msg.key === 'created-session' && msg.uiKey === uiKey) {
          const { sessionKey } = msg;
          // Create TtyXterm, initialise and register
          const ttyXterm = new TtyXterm({
            canonicalPath: msg.canonicalPath,
            sessionKey,
            linesPerUpdate: 100,
            refreshMs: 10,
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
};

export type Thunk = ActionsUnion<typeof Thunk>;

export const reducer = (state = initialState, act: Action): State => {
  switch (act.type) {
    case '[xterm] register': return { ...state,
      instance: addToLookup(createXTermState(act.pay), state.instance),
    };
    case '[xterm] setup': return { ...state,
      worker: act.pay.worker,
      voice: act.pay.voice,
      ready: true,
    };
    case '[xterm] unregister': return { ...state,
      instance: removeFromLookup(act.pay.key, state.instance),
    };
    default: return state;
  }
};
