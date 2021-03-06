import create from 'zustand';
import { devtools } from 'zustand/middleware';
import { Subscription } from 'rxjs';
import { KeyedLookup } from '@model/generic.model';
import { TtyShell } from '@model/shell/tty.shell';
import { OpenFileDescription } from '@model/shell/file.model';
import { FromFdToOpenKey } from '@model/shell/process.model';
import { FileWithMeta } from '@model/shell/parse.model';
import { ToProcVar, NamedFunction } from '@model/shell/var.model';
import { processService } from '@model/shell/process.service';
import { FsFile } from "@model/shell/file.model";
import { addToLookup, removeFromLookup } from './store.util';
import { fileService } from '@model/shell/file.service';
import { MessageFromWorld, MessageToWorld } from '@model/env/world.device';

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
  ofd: KeyedLookup<OpenFileDescription<any>>;
  /** Global file system */
  fs: KeyedLookup<FsFile>;
  /** Process groups */
  procGrp: KeyedLookup<ProcessGroup>;

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
  /**
   * Foreground process group stack.
   * - first item is the controlling process of a shell.
   * - last item is current foreground process group.
   */
  fgStack: number[];
  /** For sending/receiving world events */
  worldDevice: FsFile<MessageFromWorld, MessageToWorld>;
}

export interface Process {
  key: string;
  sessionKey: string;
  /** Process id */
  pid: number;
  /** Parent process id */
  ppid: number;
  /** Process group id. */
  pgid: number;
  /** The parse tree obtain from mvdan-sh or by wrapping a subtree */
  parsed: FileWithMeta;
  /** Result of subscribing to transpilation of `parsed` */
  subscription: null | Subscription;
  /** File descriptor to open file */
  fdToOpen: Record<string, OpenFileDescription<any>>;
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
  toFunc: Record<string, NamedFunction>;
  lastExitCode: null | number;
  lastBgPid: null | number;
  /** For cancelling current executions */
  cleanups: (() => void)[];
}


export interface ProcessGroup {
  /** `pgid` as a string */
  key: string;
  /** Identifier */
  pgid: number;
  /** Parent session */
  sessionKey: string;
  /**
   * Pids of processes in the group
   * which have not yet terminated.
   */
  pids: number[];
}

const useStore = create<State>(devtools((set, get) => {
  // 2 disconnected streams
  const nullFile = fileService.makeDevice('/dev/null');

  return {
    nextTtyId: 1,
    session: {},
    toSessionKey: {},
    nextProcId: 1,
    proc: {},
    fs: {
      [nullFile.key]: nullFile,
    },
    // NOTE we're also using /dev/null to identify an open file description
    ofd: addToLookup(
      new OpenFileDescription('/dev/null', nullFile),
      {} as State['ofd'],
    ),
    procGrp: {},
    api: {
      createSession: (alias) => {
        const { toSessionKey, nextTtyId: ttyId } = get();
        if (toSessionKey[alias]) {
          return;
        }

        const ttyFilename = `tty-${ttyId}`;
        const sessionKey = `root@${ttyFilename}`;
        const canonicalPath = `/dev/${ttyFilename}`;
        // 2 streams that'll be connected via TtyXterm and TtyShell
        const ttyFile = fileService.makeTty(canonicalPath);
        const ttyShell = new TtyShell(sessionKey, canonicalPath, ttyFile);
        /**
         * 2 streams where:
         * - builtin's can write to mutate the world.
         * - builtins can read world events.
         */
        const worldDevice = fileService.makeDevice(`/dev/world-${ttyId}`);

        set(({ toSessionKey, nextProcId: sid, nextTtyId, session, fs, ofd }: State) => ({
          toSessionKey: { ...toSessionKey, [alias]: sessionKey },
          session: addToLookup({
            key: sessionKey,
            sid,
            ttyId,
            ttyShell,
            fgStack: [sid],
            worldDevice,
          }, session),
          nextProcId: sid + 1, // We'll create a process directly below
          nextTtyId: nextTtyId + 1,
          fs: {
            ...fs,
            [ttyFile.key]: ttyFile,
            [worldDevice.key]: worldDevice,
          },
          // NOTE we also use /dev/tty-${ttyId} to identify an open file description
          ofd: addToLookup(new OpenFileDescription(canonicalPath, ttyFile), ofd),
        }));

        processService.createLeadingProcess(sessionKey);
      },
      removeSession: (alias) => {
        /**
         * TODO
         * - stop/remove descendent processes
         * - remove orphan ofds
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

// Provide direct access to api
Object.assign(useStore, { api: useStore.getState().api });

export default useStore as typeof useStore & { api: State['api'] };

// Must invoke after default export
processService.initialise();
