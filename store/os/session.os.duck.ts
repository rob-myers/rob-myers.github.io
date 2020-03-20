import { addToLookup, updateLookup, removeFromLookup, SyncAct, SyncActDef } from '@model/redux.model';
import { OsThunkAct, createOsThunk, createOsAct } from '@model/os/os.redux.model';
import { OsAct } from '@model/os/os.model';
import { BinaryExecType } from '@model/sh/binary.model';
import { ProcessSignal } from '@model/os/process.model';
import { osCreateTtyThunk } from './tty.os.duck';
import { State } from './os.duck';
import { TtyINode } from '@store/inode/tty.inode';
import { osForkProcessThunk, osCloseProcessFdsAct, osSetProcessGroupAct, osExecTermThunk, osStartProcessThunk, osTerminateProcessThunk } from './process.os.duck';
import { osOpenFileThunk, osUnlinkFileThunk } from './file.os.duck';
import { osSetProcessUserThunk } from './user.os.duck';
import { ensureArrayItem, last, testNever } from '@model/generic.model';
import { isInteractiveShell, findAncestralTerm, isBash } from '@os-service/term.util';

/**
 * Session for login or daemon.
 * It is a sub state of os.duck's {State}.
 */
export interface OsSession {
  /**
   * Unique session identifier.
   */
  key: string;
  /**
   * Foreground process group stack.
   * 1st item is the controlling process of a login session.
   * Last item is current foreground process group.
   */
  fgStack: string[];
  /**
   * Spawning UI id e.g. can end session when UI closes.
   */
  uiKey: null | string;
  /**
   * Controlling process key.
   */
  processKey: string; 
  /**
   * The process groups in this session.
   */
  procGrps: string[];
  /**
   * The tty inode.
   */
  ttyINode: null | TtyINode;
  /**
   * Canonical filepath: /dev/tty-${ttyId}
   */
  ttyPath: null | string;
  /**
   * Login name.
   */
  userKey: string;
  /**
   * Legacy PID of session leader (?).
   */
  sid: number;
}

export type Action = (
  | IncrementTtyIdAct
  | RegisterSessionAct
  | SetSessionForegroundAct
  | UnregisterSessionAct
);

/**
 * Increment the tty numeric identifier.
 */
interface IncrementTtyIdAct extends SyncAct<OsAct, {}> {
  type: OsAct.OS_INCREMENT_TTY_ID;
}
export const osIncrementTtyIdAct = createOsAct<OsAct, IncrementTtyIdAct>(
  OsAct.OS_INCREMENT_TTY_ID,
);
export const osIncrementTtyIdDef: SyncActDef<OsAct, IncrementTtyIdAct, State> =
(_, state) => ({
  ...state,
  aux: { ...state.aux, nextTtyId: state.aux.nextTtyId + 1 },
});

/**
 * Add login session or init's session to state.
 */
export const osRegisterSessionAct = createOsAct<OsAct, RegisterSessionAct>(
  OsAct.OS_REGISTER_SESSION,
);
interface RegisterSessionAct extends SyncAct<OsAct, {
  /** For example `tty-1`. */
  sessionKey: string;
  uiKey: null | string;
  /**
   * Controlling process id i.e. for a bash instance.
   * If initial session, this process will not yet exist.
   * Otherwise, process will already have been forked.
   */
  processKey: string;
  /** If `processKey` is 'init' this is too, else inherited from parent. */
  processGroupKey: string;
  /** Username. */
  userKey: string;
  ttyINode: null | TtyINode;
  ttyPath: null | string;
}> {
  type: OsAct.OS_REGISTER_SESSION;
}
export const osRegisterSessionDef: SyncActDef<OsAct, RegisterSessionAct, State> = (payload, state) => {
  const {
    sessionKey, userKey, uiKey, processKey,
    processGroupKey, ttyINode, ttyPath,
  } = payload;
  const { aux: { nextPid }, session, proc } = state;

  const newSession: OsSession = {
    // `init` has no foreground, but each login session does.
    fgStack: [],
    key: sessionKey,
    uiKey,
    /**
     * If initial session, process won't exist yet.
     * Otherwise will already have been forked.
     */
    processKey,
    /**
     * Controlling process of session has own process group.
     * 
     * For init session, {spawnInitThunk} does this via
     * {OS_REGISTER_PROCESS} with {parentPgKey} null.
     * 
     * For login sessions see {createLoginSessionThunk}:
     * {OS_REGISTER_PROCESS} adds it to the process group 'init'.
     * {createProcessGroupAct} moves it into own group.
     */
    procGrps: [processGroupKey],
    /**
     * If initial session use next PID, else use previous.
     */
    sid: nextPid === 1 ? nextPid : nextPid - 1,
    ttyINode,
    ttyPath,
    userKey,
  };
  return { ...state,
    session: addToLookup(newSession, session),
    // Set sessionKey of controlling process.
    proc: updateLookup(processKey, proc, () => ({ sessionKey })),
  };
};

/**
 * Set the foreground process group of process's session.
 * Used when creating a login using {createLoginSessionThunk}.
 * Used when launching binary via {SimpleComposite} from interactive bash.
 * Used when launching pipeline via {PipeComposite} from interactive bash.
 */
export const osSetSessionForegroundAct = createOsAct<OsAct, SetSessionForegroundAct>(OsAct.OS_SET_SESSION_FOREGROUND);
interface SetSessionForegroundAct extends SyncAct<OsAct, { processKey: string; processGroupKey: string }> {
  type: OsAct.OS_SET_SESSION_FOREGROUND;
}
export const osSetSessionForegroundDef: SyncActDef<OsAct, SetSessionForegroundAct, State> = ({ processKey, processGroupKey }, state) => ({
  ...state,
  session: updateLookup(
    state.proc[processKey].sessionKey,
    state.session,
    ({ fgStack }) => ({ fgStack: ensureArrayItem(fgStack, processGroupKey) }),
  ),
});

/**
 * Remove session from state.
 */
export const osUnregisterSessionAct = createOsAct<OsAct, UnregisterSessionAct>(
  OsAct.OS_UNREGISTER_SESSION,
);
interface UnregisterSessionAct extends SyncAct<OsAct, { sessionKey: string }> {
  type: OsAct.OS_UNREGISTER_SESSION;
}
export const osUnregisterSessionDef: SyncActDef<OsAct, UnregisterSessionAct, State> =
({ sessionKey }, state) => ({
  ...state,
  session: removeFromLookup(sessionKey, state.session),
});


export type Thunk = (
  | CreateSessionThunk
  | SignalForegroundThunk
  | IsLoginShellThunk
);

/**
 * Creates a login session:
 * - Creates a terminal (getatty).
 * - Forks init process and redirect to terminal.
 * - Sets user (setuid) and environment.
 * - Create new process group (setpgid).
 * - Execs bash interactively.
 */
export const osCreateSessionThunk = createOsThunk<OsAct, CreateSessionThunk>(
  OsAct.OS_CREATE_SESSION_THUNK,
  ({ dispatch, service }, { uiKey, userKey }) => {

    const { canonicalPath, sessionKey, iNode: ttyINode } = dispatch(osCreateTtyThunk({
      userKey,
    }));
    /**
     * Fork 'init', close fds, open tty at std{in,out,err}, set environment HOME, PWD etc.
     */
    const processKey = `bash.${sessionKey}`;
    dispatch(osForkProcessThunk({ parentKey: 'init', processKey }));
    dispatch(osCloseProcessFdsAct({ processKey }));
    dispatch(osOpenFileThunk({ processKey, request: { path: canonicalPath, mode: 'RDONLY' } }));
    dispatch(osOpenFileThunk({ processKey, request: { path: canonicalPath, mode: 'WRONLY' } }));
    dispatch(osOpenFileThunk({ processKey, request: { path: canonicalPath, mode: 'WRONLY' } }));
    dispatch(osSetProcessUserThunk({ processKey, userKey }));
    /**
     * Register new session.
     */
    const processGroupKey = processKey;
    dispatch(osRegisterSessionAct({ uiKey: uiKey, processKey, processGroupKey, sessionKey, ttyINode, ttyPath: canonicalPath, userKey }));
    /**
     * Controlling process has own process group.
     */
    dispatch(osSetProcessGroupAct({ processKey, processGroupKey }));
    /**
     * Controlling process should run interactive bash.
     */
    // const bashTerm = new BashBinary({ key: CompositeType.binary, binaryKey: BinaryExecType.bash, args: [] });
    const bashTerm = service.term.createBinary({ binaryKey: BinaryExecType.bash, args: []});
    dispatch(osExecTermThunk({ processKey, term: bashTerm, command: '-bash' }));
    /**
     * Start controlling process.
     */
    dispatch(osStartProcessThunk({ processKey }));

    return { sessionKey, canonicalPath };
  },
);
interface CreateSessionThunk extends OsThunkAct<OsAct,
{
  /** So can close session on ui close, if needed */
  uiKey: string;
  userKey: string;
},
// Outputs a session key.
{ sessionKey: string; canonicalPath: string }
> {
  type: OsAct.OS_CREATE_SESSION_THUNK;
}

/**
 * End session, terminating controlling process.
 */
export const osEndSessionThunk = createOsThunk<OsAct, EndSessionThunk>(
  OsAct.OS_END_SESSION_THUNK,
  ({ dispatch, state: { os } }, { sessionKey }) => {
    const { processKey, ttyINode, procGrps } = os.session[sessionKey];
    if (ttyINode) {// Unlink /dev/tty-{ttyId}.
      dispatch(osUnlinkFileThunk({ processKey, path: ttyINode.def.canonicalPath }));
    }
    // Terminate process.
    dispatch(osTerminateProcessThunk({ processKey, exitCode: 0 }));
    procGrps.forEach((key) => dispatch(osTerminateProcessThunk({ processKey: key, exitCode: 0 })));

    // Remove session from lookup.
    dispatch(osUnregisterSessionAct({ sessionKey }));
  },
);
interface EndSessionThunk extends OsThunkAct<OsAct, { sessionKey: string }, void> {
  type: OsAct.OS_END_SESSION_THUNK;
}

/**
 * Signal foreground process-group in specified session.
 * Foreground group is either:
 * a process whose {term} is interactive bash,
 * a process whose binary was spawned via bash.
 * a set of binaries in a pipeline spawned via bash.
 */
export const osSignalForegroundThunk = createOsThunk<OsAct, SignalForegroundThunk>(
  OsAct.OS_SIGNAL_FOREGROUND_THUNK,
  ({ state: { os }, dispatch }, { sessionKey, signal }) => {

    // Possibly no foreground e.g. 'init' has none.
    const { fgStack } = os.session[sessionKey];
    if (!fgStack.length) {
      return;
    }
    // Get process keys in foreground group.
    const fgKey = last(fgStack) as string;
    const { procKeys } = os.procGrp[fgKey];

    /**
     * If foreground group is not singleton interactive bash, then
     * expect that the parent of the 1st process in group _is_.
     * We'll signal it after the others.
     */
    const signalKeys = procKeys.slice();
    const first = os.proc[signalKeys[0]];

    if (!(signalKeys.length === 1 && isInteractiveShell(first.term))) {
      if (isInteractiveShell(os.proc[first.parentKey].term)) {
        signalKeys.push(first.parentKey); // Signal it last.
      } else {
        console.log(`Signal '${signal}' for foreground of session '${sessionKey}' was ignored.`);
        return;
      }
    }

    for (const processKey of signalKeys) {
      const { sigHandler, term, command } = os.proc[processKey];
      const handler = sigHandler[signal];

      if (!handler) {// Terminate if signal unhandled
        dispatch(osTerminateProcessThunk({ processKey, exitCode: 0 }));
        continue;
      }

      if (handler.cleanup) {
        handler.cleanup();
      }

      switch(handler.do) {
        case 'ignore': {
          break;
        }
        case 'reset': {
          dispatch(osExecTermThunk({ processKey, term, command }));
          dispatch(osStartProcessThunk({ processKey }));
          break;
        }
        case 'terminate': {
          dispatch(osTerminateProcessThunk({ processKey, exitCode: 0 })); 
          break;
        }
        default: throw testNever(handler.do);
      }
    }
  }
);

interface SignalForegroundThunk extends OsThunkAct<OsAct, { sessionKey: string; signal: ProcessSignal}, void> {
  type: OsAct.OS_SIGNAL_FOREGROUND_THUNK;
}

export const osIsLoginShell = createOsThunk<OsAct, IsLoginShellThunk>(
  OsAct.OS_IS_LOGIN_SHELL,
  ({ state: { os } }, { processKey }): boolean => {
    const { term, sessionKey } = os.proc[processKey];
    const closestBash = isBash(term) ? term : findAncestralTerm(term, isBash);
    const { term: sessionLeaderTerm } = os.proc[os.session[sessionKey].processKey];
    return sessionLeaderTerm === closestBash;
  },
);
interface IsLoginShellThunk extends OsThunkAct<OsAct, { processKey: string }, boolean> {
  type: OsAct.OS_IS_LOGIN_SHELL;
}
