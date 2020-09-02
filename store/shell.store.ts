import create from 'zustand';
import { devtools } from 'zustand/middleware';
import { Subscription, Subject } from 'rxjs';
import { KeyedLookup } from '@model/generic.model';
import { TtyShell } from '@model/shell/tty.shell';
import { OpenFileDescription, createOfd } from '@model/shell/file.model';
import { SigEnum, FromFdToOpenKey } from '@model/shell/process.model';
import { FileWithMeta } from '@model/shell/parse.service';
import { ToProcVar } from '@model/shell/var.model';
import { processService } from '@model/shell/process.service';
import { ShellStream } from '@model/rxjs/shell.stream';
import { varService } from '@model/shell/var.service';
import { addToLookup, removeFromLookup } from './store.util';

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
  /** Global file system */
  fs: KeyedLookup<FsFile>;

  readonly api: {
    createSession: (alias: string) => void;
    removeSession: (alias: string) => void;
    /**
     * Useful for tracking external state changes in devtools.
     * Can't use `immer`: recursive parse trees caused stack overflows.
     */
    set: (delta: ((current: State) => Partial<State>)) => void;
  };
}

export interface Session {
  key: string;
  /** Used as pid of leading process */
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
  /** File descriptor to open key */
  fdToOpenKey: FromFdToOpenKey;
  /**
   * Process code-blocks such as `while, if, for, {}` have redirection scope.
   * The 1st item corresponds to the current scope, the last to the top-most
   * scope. An item has key `fd` iff `fd` was set (redirected) in its respective scope.
   */
  nestedRedirs: FromFdToOpenKey[];
  /**
   * - 1st item contains vars set in current scope (deepest).
   * - Last item is earliest scope, rest are induced by
   *   functions, builtins, and sourced-scripts.
   * - Key 0 (0th positional parameter) exists in scope iff
   *   earliest scope, or scope induced by function, sourced-script, or builtin.
   * - Thus to get positional parameters find 1st scope with 0.
   */
  nestedVars: ToProcVar[];
  lastExitCode: null | number;
  lastBgPid: null | number;
}

interface FsFile {
  key: string;
  stream: ShellStream<any, any>;
}

const useStore = create<State>(devtools((set, get) => {
  const devNull = new ShellStream({ readable: new Subject, writable: new Subject });

  return {
    nextTtyId: 1,
    session: {},
    toSessionKey: {},
    nextProcId: 1,
    proc: {},
    // We're using /dev/null to identify an open file description
    ofd: addToLookup(createOfd('/dev/null', devNull), {} as State['ofd']),
    fs: addToLookup({ key: '/dev/null', stream: devNull }, {} as State['fs']),
    api: {
      createSession: (alias) => {
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
          // fs: addToLookup({ key: canonicalPath, stream: ttyShell.xterm.io }, fs),
        }));

        processService.createLeadingProcess(sessionKey);
      },
      removeSession: (alias) => {
        /**
         * TODO
         * - stop/remove descendent processes
         * - remove any orphan ofds
         */
        set(({ session, toSessionKey: { [alias]: sessionKey, ...rest }, fs }) => ({
          session: removeFromLookup(sessionKey, session),
          toSessionKey: { ...rest },
          fs: removeFromLookup(session[sessionKey]?.ttyShell.canonicalPath, fs),
        }));
      },
      set,
    },
  };
}, 'shell'));


export default useStore;

// Must invoke after default export
processService.initialise();
varService.initialise();