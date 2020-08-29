import create from 'zustand';
import { devtools } from 'zustand/middleware';
import produce from 'immer';
import { Subscription, Observable, Subject } from 'rxjs';
import { KeyedLookup } from '@model/generic.model';
import { TtyShell } from '@model/shell/tty.wrapper';
import ProcessService from '@model/shell/process.service';
import { OpenFileDescription } from '@model/shell/file.model';
import { SigEnum } from '@model/shell/process.model';

export interface State {
  /** Each terminal connects to a session */
  session: KeyedLookup<Session>;
  /** Next tty identifier, inducing e.g. tty-2 */
  nextTtyId: number;
  /** Sessions are aliased */
  toSessionKey: { [alias: string]: string };

  readonly api: {
    ensureSession: (alias: string) => void;
    signalSession: (sessionKey: string, signal: SigEnum) => void;
    /** Useful e.g. to track external state changes in devtools */
    set: (delta: ((current: State) => void)) => void;
  };
}

export interface Session {
  key: string;
  ttyId: number;
  ttyShell: TtyShell;
  /** Next process id in this session */
  nextProcId: number;
  /** Opened files are registered here */
  ofd: KeyedLookup<OpenFileDescription>;
  /** Processes in this session */
  process: KeyedLookup<Process>;
  service: ProcessService;
}

export interface Process {
  key: string;
  pid: number;
  ppid: number;
  observable: Observable<any>; // TODO type observations
  subscription: Subscription;
}

const useStore = create<State>(devtools((set, get) => {

  return {
    session: {},
    nextTtyId: 1,
    toSessionKey: {},
    api: {
      ensureSession: (alias) => {
        const { toSessionKey, nextTtyId: ttyId } = get();
        if (toSessionKey[alias]) {
          return;
        }
        const ttyFilename = `tty-${ttyId}`;
        const sessionKey = `root@${ttyFilename}`;
        const canonicalPath = `/dev/${ttyFilename}`;
        const service = new ProcessService(sessionKey);
        const ttyShell = new TtyShell(sessionKey, canonicalPath);
        const devNull = new Subject;

        set(produce((state: State) => {
          state.nextTtyId++;
          state.toSessionKey[alias] = sessionKey;
          state.session[sessionKey] = {
            key: sessionKey,
            ttyId,
            ttyShell,
            nextProcId: 1,
            ofd: {
              'rd-null': service.createOfd('null', devNull, { mode: 'RDONLY' }),
              'wr-null': service.createOfd('null', devNull, { mode: 'WRONLY' }),
              /**
               * TODO
               * - tty.xterm provides stream which it writes to (instead of invoking tty.wrapper)
               * - tty.xterm provides stream which it reads from
               * - tty.handler becomes tty.shell and reads/writes tty.xterm
               */
              // 'rd-tty': service.createOfd('rd-tty', tty.inode, { mode: 'RDONLY' }),
              // 'wr-tty': service.createOfd('wr-tty', tty.inode, { mode: 'WRONLY' }),
            },
            process: {},
            service,
          };
        }));

        // Start the session
        service.createSessionLeader();
      },
      signalSession: (key, signal) => {
        console.log('received', { signal, forSession: key });
      },
      set: (delta) => set(produce(delta)),
    },
  };
}, 'shell'));

export default useStore;
