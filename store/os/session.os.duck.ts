import * as XTerm from 'xterm';
import { RedactInReduxDevTools, addToLookup, updateLookup, redact, removeFromLookup } from '@model/redux.model';
import { OsThunkAct, createOsThunk, createOsAct, SyncAct, SyncActDef } from '@model/redux.model';
import { OsAct } from '@model/os.model';
import { BinaryGuiType, BinaryExecType, BaseGuiSpec } from '@model/sh/binary.model';
import { ProcessSignal } from '@model/process.model';
import { osCreateTtyThunk } from './tty.os.duck';
import { State } from '../os.duck';
import { TtyINode } from '@store/inode/tty.inode';
import { osForkProcessThunk, osCloseProcessFdsAct, osSetProcessGroupAct, osExecTermThunk, osStartProcessThunk, osTerminateProcessThunk } from './process.os.duck';
import { osOpenFileThunk, osUnlinkFileThunk } from './file.os.duck';
import { osSetProcessUserThunk } from './user.os.duck';
import { ensureArrayItem, last, testNever } from '@model/generic.model';
import { BashBinary } from '@model/sh/binary/bash.binary';
import { CompositeType } from '@model/term.model';
import { isInteractiveShell } from '@service/term.util';

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
   * If null then using 'xterm' i.e. terminal.
   * Else binary that launched a graphical user-interface.
   */
  guiKey: null | BinaryGuiType;
  /**
   * Parent panel identifier.
   */
  panelKey: null | string;
  /**
   * Controlling process key.
   */
  processKey: string; 
  /**
   * The process groups in this session.
   */
  procGrps: string[];
  /**
   * If {guiKey} non-null, this function is invoked once respective GUI
   * finished, to resume the process which originally launched it.
   */
  resumeXTerm: null | (() => void);
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
   * From npm module 'xterm', rendered inside {WindowPane}.
   */
  xterm: null | XTerm.Terminal & RedactInReduxDevTools;
  /**
   * Legacy PID of session leader (?).
   */
  sid: number;
}

export type Action = (
  | IncrementTtyIdAct
  | RegisterSessionAct
  | SetSessionForegroundAct
  | SetSessionGuiAct
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
  panelKey: null | string;
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
  xterm: null | XTerm.Terminal & RedactInReduxDevTools;
}> {
  type: OsAct.OS_REGISTER_SESSION;
}
export const osRegisterSessionDef: SyncActDef<OsAct, RegisterSessionAct, State> = (payload, state) => {
  const {
    sessionKey, userKey, panelKey, processKey,
    processGroupKey, xterm, ttyINode, ttyPath,
  } = payload;
  const { aux: { nextPid }, session, proc } = state;

  const newSession: OsSession = {
    // `init` has no foreground, but each login session does.
    fgStack: [],
    guiKey: null,
    key: sessionKey,
    panelKey,
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
    resumeXTerm: null,
    /**
     * If initial session use next PID, else use previous.
     */
    sid: nextPid === 1 ? nextPid : nextPid - 1,
    ttyINode,
    ttyPath,
    userKey,
    xterm,
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
 * Start using a GUI.
 */
export const osSetSessionGuiAct = createOsAct<OsAct, SetSessionGuiAct>(
  OsAct.OS_SET_SESSION_GUI,
);
interface SetSessionGuiAct extends SyncAct<OsAct, {
  sessionKey: string;
  guiKey: null | BinaryGuiType;
  resumeXTerm: null | (() => void);
}> {
  type: OsAct.OS_SET_SESSION_GUI;
}
export const osSetSessionGuiDef: SyncActDef<OsAct, SetSessionGuiAct, State> =
({ guiKey, resumeXTerm, sessionKey }, state) => ({
  ...state,
  session: updateLookup(sessionKey, state.session, () => ({ guiKey, resumeXTerm })),
});

/**
 * Remove session from state.
 */
export const osUnregisterSessionAct = createOsAct<OsAct, UnregisterSessionAct>(
  OsAct.OS_UNREGISTER_SESSION,
);
export interface UnregisterSessionAct extends SyncAct<OsAct, { sessionKey: string }> {
  type: OsAct.OS_UNREGISTER_SESSION;
}
export const osUnregisterSessionDef: SyncActDef<OsAct, UnregisterSessionAct, State> =
({ sessionKey }, state) => ({
  ...state,
  session: removeFromLookup(sessionKey, state.session),
});


export type Thunk = (
  | CreateSessionThunk
  | ExitGuiThunk
  | LaunchGuiThunk
  | SignalForegroundThunk
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
  ({ dispatch }, { panelKey, userKey, xterm }) => {

    const { canonicalPath: ttyPath, sessionKey, iNode: ttyINode } = dispatch(osCreateTtyThunk({
      userKey,
      xterm: redact(xterm, 'XTerm.Terminal'),
    }));
    /**
     * Fork 'init', close fds, open tty at std{in,out,err}, set environment HOME, PWD etc.
     */
    const processKey = `bash.${sessionKey}`;
    dispatch(osForkProcessThunk({ parentKey: 'init', processKey }));
    dispatch(osCloseProcessFdsAct({ processKey }));
    dispatch(osOpenFileThunk({ processKey, request: { path: ttyPath, mode: 'RDONLY' } }));
    dispatch(osOpenFileThunk({ processKey, request: { path: ttyPath, mode: 'WRONLY' } }));
    dispatch(osOpenFileThunk({ processKey, request: { path: ttyPath, mode: 'WRONLY' } }));
    dispatch(osSetProcessUserThunk({ processKey, userKey }));
    /**
     * Register new session.
     */
    const processGroupKey = processKey;
    dispatch(osRegisterSessionAct({ panelKey, processKey, processGroupKey, sessionKey, ttyINode, ttyPath, userKey, xterm }));
    /**
     * Controlling process has own process group.
     */
    dispatch(osSetProcessGroupAct({ processKey, processGroupKey }));
    /**
     * Controlling process should run interactive bash.
     */
    const bashTerm = new BashBinary({ key: CompositeType.binary, binaryKey: BinaryExecType.bash, args: [] });
    dispatch(osExecTermThunk({ processKey, term: bashTerm }));
    /**
     * Start controlling process.
     */
    dispatch(osStartProcessThunk({ processKey }));

    return { sessionKey };
  },
);
interface CreateSessionThunk extends OsThunkAct<OsAct,
  {
    /** Need to know parent panel so can end session when panel closed via UI. */
    panelKey: string;
    userKey: string;
    xterm: XTerm.Terminal & RedactInReduxDevTools;
  },
  // Outputs a session key.
  { sessionKey: string }
> {
  type: OsAct.OS_CREATE_SESSION_THUNK;
}

/**
 * End session, terminating controlling process.
 */
export const osEndSessionThunk = createOsThunk<OsAct, EndSessionThunk>(
  OsAct.OS_END_SESSION_THUNK,
  ({ dispatch, state: { os } }, { sessionKey }) => {
    // console.log(sessionKey, os.session);
    const { processKey, ttyINode, xterm } = os.session[sessionKey];
    if (ttyINode) {// Unlink /dev/tty-{ttyId}.
      dispatch(osUnlinkFileThunk({ processKey, path: ttyINode.def.canonicalPath }));
    }
    if (xterm) {
      xterm.dispose();
    }
    // Terminate process.
    dispatch(osTerminateProcessThunk({ processKey, exitCode: 0 }));
    // Remove session from lookup.
    dispatch(osUnregisterSessionAct({ sessionKey }));
  },
);
export interface EndSessionThunk extends OsThunkAct<OsAct, { sessionKey: string }, void> {
  type: OsAct.OS_END_SESSION_THUNK;
}

/**
 * Exit GUI in {sessionKey} and return to the terminal.
 */
export const osExitGuiThunk = createOsThunk<OsAct, ExitGuiThunk>(
  OsAct.OS_EXIT_GUI_THUNK,
  ({ state: { os } }, { sessionKey }) => {
    const { resumeXTerm } = os.session[sessionKey];
    if (resumeXTerm) {
      resumeXTerm();
    } else {
      throw Error(`Expected non-null 'resumeXTerm' in session '${sessionKey}'`);
    }
  },
);
interface ExitGuiThunk extends OsThunkAct<OsAct, { sessionKey: string }, void> {
  type: OsAct.OS_EXIT_GUI_THUNK;
}

/**
 * Launch GUI in session of {processKey}.
 * Always launched via a binary running in {processKey}.
 * Displays the GUI by setting {session.guiKey}.
 * To resume XTerm afterwards, invoke {session.resumeXTerm}.
 */
export const osLaunchGuiThunk = createOsThunk<OsAct, LaunchGuiThunk>(
  OsAct.OS_LAUNCH_GUI_THUNK,
  ({ dispatch, state: { os }}, { guiKey, processKey }) => {
    const { sessionKey } = os.proc[processKey];
    const toPromise = () => new Promise<void>((resolve) =>
      dispatch(osSetSessionGuiAct({
        sessionKey,
        guiKey,
        resumeXTerm: () => {
          dispatch(osSetSessionGuiAct({ sessionKey, guiKey: null, resumeXTerm: null }));
          resolve(); // Resume suspended process.
        },
      }))
    );
    return { toPromise };
  },
);
interface LaunchGuiThunk extends OsThunkAct<OsAct,
  { processKey: string } & BaseGuiSpec,
  { toPromise: () => Promise<void> }
> {
  type: OsAct.OS_LAUNCH_GUI_THUNK;
}


// /**
//  * _TODO_ review.
//  * Store 'sessionKey' and 'title' in panelMeta.
//  * Also applies title to panel via underlying GoldenLayout API.
//  */
// export const setSessionPanelMetasThunk = createOsThunk<OsAct, SetSessionPanelMetasThunk>(
//   OsAct.OS_SET_SESSION_PANEL_METAS_THUNK,
//   ({ dispatch }, { panelKey, panelMeta }) => {
//     dispatch(layoutAttachPanelDataAct({ panelKey, panelMeta }));
//     dispatch(layoutSetPanelTitleThunk({ panelKey, title: panelMeta.title }));
//   },
// );
// interface SetSessionPanelMetasThunk extends OsThunkAct<OsAct,
//   {
//     panelKey: string;
//     panelMeta: Required<LayoutPanelMeta<OsPanelMetaKey>>;
//   },
//   void
// > {
//   type: OsAct.OS_SET_SESSION_PANEL_METAS_THUNK;
// }

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
     * We'll signal it after the others, which will 'reset' it.
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
      const { sigHandler, term } = os.proc[processKey];
      const handler = sigHandler[signal];

      switch(handler) {
        case 'ignore': {
          break;
        }
        case 'reset': {
          dispatch(osExecTermThunk({ processKey, term }));
          dispatch(osStartProcessThunk({ processKey }));
          break;
        }
        case 'terminate':
        case undefined:
        {
          dispatch(osTerminateProcessThunk({ processKey, exitCode: 0 })); 
          break;
        }
        default: throw testNever(handler);
      }
    }
  }
);

interface SignalForegroundThunk extends OsThunkAct<OsAct, { sessionKey: string; signal: ProcessSignal}, void> {
  type: OsAct.OS_SIGNAL_FOREGROUND_THUNK;
}
