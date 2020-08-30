import create from 'zustand';
import { devtools } from 'zustand/middleware';
import produce from 'immer';
import { Subscription, Observable, Subject } from 'rxjs';
import { KeyedLookup } from '@model/generic.model';
import { TtyShell } from '@model/shell/tty.shell';
import ProcessService from '@model/shell/process.service';
import { OpenFileDescription, createOfd } from '@model/shell/file.model';
import { SigEnum } from '@model/shell/process.model';

export interface State {
  /** Next tty identifier, inducing e.g. tty-2 and sessionKey */
  nextTtyId: number;
  /** Each terminal connects to a session */
  session: KeyedLookup<Session>;
  /** Sessions are aliased */
  toSessionKey: { [alias: string]: string };  
  /** Next process id */
  nextProcId: number;
  /** Processes, each with a parent session */
  proc: KeyedLookup<Process>;
  /** Opened files are registered here */
  ofd: KeyedLookup<OpenFileDescription>;

  readonly api: {
    ensureSession: (alias: string) => void;
    service: ProcessService;
    signalSession: (sessionKey: string, signal: SigEnum) => void;
    /** Useful e.g. to track external state changes in devtools */
    set: (delta: ((current: State) => void)) => void;
  };
}

export interface Session {
  key: string;
  ttyId: number;
  ttyShell: TtyShell;
}

export interface Process {
  key: string;
  sessionKey: string;
  pid: number;
  ppid: number;
  observable: Observable<any>; // TODO type observations
  subscription: Subscription;
}

const useStore = create<State>(devtools((set, get) => {
  const devNull = new Subject;
  const service = new ProcessService;

  return {
    nextTtyId: 1,
    session: {},
    toSessionKey: {},
    nextProcId: 1,
    proc: {},
    ofd: {
      '/dev/null': createOfd('/dev/null', devNull, { mode: 'RDWR' }),
    },
    api: {
      ensureSession: (alias) => {
        const { toSessionKey, nextTtyId: ttyId } = get();
        if (toSessionKey[alias]) {
          return;
        }
        const ttyFilename = `tty-${ttyId}`;
        const sessionKey = `root@${ttyFilename}`;
        const canonicalPath = `/dev/${ttyFilename}`;
        const ttyShell = new TtyShell(sessionKey, canonicalPath);

        set(produce((state: State) => {
          state.nextTtyId++;
          state.toSessionKey[alias] = sessionKey;
          state.session[sessionKey] = {
            key: sessionKey,
            ttyId,
            ttyShell,
          };
        }));

        // Start the session
        get().api.service.createSessionLeader(sessionKey);
      },
      service,
      signalSession: (key, signal) => {
        console.log('received', { signal, forSession: key });
      },
      set: (delta) => set(produce(delta)),
    },
  };
}, 'shell'));

export default useStore;
