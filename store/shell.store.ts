import create from 'zustand';
import { devtools } from 'zustand/middleware';
import { Subscription, Subject } from 'rxjs';
import { KeyedLookup } from '@model/generic.model';
import { TtyShell } from '@model/shell/tty.shell';
import { OpenFileDescription, createOfd } from '@model/shell/file.model';
import { SigEnum } from '@model/shell/process.model';
import { FileWithMeta } from '@model/shell/parse.service';
import { processService } from '@model/shell/process.service';
import { addToLookup } from './store.util';

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
    signalSession: (sessionKey: string, signal: SigEnum) => void;
    /**
     * Useful e.g. to track external state changes in devtools.
     * We cannot use `immer` here: saw stack overflows.
     */
    set: (delta: ((current: State) => Partial<State>)) => void;
  };
}

export interface Session {
  key: string;
  // Used as pid of leading process
  sid: number;
  ttyId: number;
  ttyShell: TtyShell;
}

export interface Process {
  key: string;
  sessionKey: string;
  pid: number;
  ppid: number;
  parsed: FileWithMeta;
  subscription: null | Subscription;
}

const useStore = create<State>(devtools((set, get) => {
  const devNull = new Subject;

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

        set(({ toSessionKey, nextProcId, nextTtyId, session }: State) => ({
          toSessionKey: { ...toSessionKey, [alias]: sessionKey },
          session: addToLookup({
            key: sessionKey,
            sid: nextProcId,
            ttyId,
            ttyShell,
          }, session),
          nextProcId: nextProcId + 1,
          nextTtyId: nextTtyId + 1,
        }));

        processService.createLeadingProcess(sessionKey);
      },
      signalSession: (key, signal) => {
        console.log('received', { signal, forSession: key });
      },
      set,
    },
  };
}, 'shell'));

export default useStore;
