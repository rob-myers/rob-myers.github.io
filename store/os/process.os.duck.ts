/* eslint-disable @typescript-eslint/no-use-before-define */
import { Subscription } from 'rxjs';

import { mapValues, ensureArrayItem, last, testNever } from '@model/generic.model';
import { SyncActDef, SyncAct, updateLookup, addToLookup, removeFromLookup, ReduxUpdater, redact } from '@model/redux.model';
import { createOsThunk, OsThunkAct, createOsAct } from '@model/os/os.redux.model';
import { OsAct, OsProcGroup } from '@model/os/os.model';
import { Term, CompositeType } from '@model/os/term.model';
import { ProcessState, UnregisteredProcess, FromFdToOpenKey, ProcessSigHandler, CodeStackItem } from '@model/os/process.model';
import { closeFd } from '@os-service/filesystem.service';
import { State } from '@store/os/os.duck';
import { osIncrementOpenAct, osReadThunk, osWriteThunk, IoToPromise, osOpenFileThunk } from '@store/os/file.os.duck';
import { osExpandVarThunk, osAssignVarThunk, osRestrictToEnvThunk } from './declare.os.duck';
import { cloneVar } from '@os-service/process-var.service';
import { OpenFileRequest } from '@model/os/file.model';
import { osSetSessionForegroundAct } from './session.os.duck';
import { builtinKeyToCommand } from '@model/sh/builtin.model';
import { osGetHistoricalSrc } from './parse.os.duck';
import { TermError } from '@model/os/service/term.util';

export type Action = (
  | ClearBufferAct
  | CloseProcessFdsAct
  | PopCodeStackAct
  | PushCodeStackAct
  | RegisterProcessAct
  | SetProcessGroupAct
  | SetSignalHandlerAct
  | StoreExitCodeAct
  | StoreProcessSubscriptionAct
  | UnregisterProcessAct
  | UpdateProcessAct
);

export const osClearBufferAct = createOsAct<OsAct, ClearBufferAct>(
  OsAct.OS_CLEAR_PROCESS_BUFFER,
);
interface ClearBufferAct extends SyncAct<OsAct, { processKey: string }> {
  type: OsAct.OS_CLEAR_PROCESS_BUFFER;
}
export const osClearBufferDef: SyncActDef<OsAct, ClearBufferAct, State> = ({ processKey }, state) => ({
  ...state,
  proc: updateLookup(processKey, state.proc, () => ({
    buffer: [],
  })),
});

/**
 * Close all open file descriptions using {nestedRedirs}.
 *
 * Last item is {fdToOpenKey} in process 'top-level scope'.
 * Other items describe openings in respective scopes.
 * {fdToOpenKey} is assign({}, ...nestedRedirs.reverse()).
 */
export const osCloseProcessFdsAct = createOsAct<OsAct, CloseProcessFdsAct>(
  OsAct.OS_CLOSE_PROCESS_FDS
);
interface CloseProcessFdsAct extends SyncAct<OsAct, { processKey: string }> {
  type: OsAct.OS_CLOSE_PROCESS_FDS;
}
export const osCloseProcessFdsDef: SyncActDef<OsAct, CloseProcessFdsAct, State> = ({ processKey }, state) => {
  const { nestedRedirs } = state.proc[processKey];
  /**
   * {closeFd} decrements {numLinks} of open file descriptions
   * and removes those whose {numLinks} is zero.
   */
  let nextOfd = state.ofd;
  nestedRedirs.forEach((fromFd) => {
    const fds = Object.keys(fromFd).map(Number);
    nextOfd = fds.reduce((agg, fd) => closeFd({ fromFd, fd, ofd: agg, warnNonExist: true }), nextOfd);
  });

  return {
    ...state,
    ofd: nextOfd,
    proc: updateLookup(processKey, state.proc, () => ({ fdToOpenKey: {}, nestedRedirs: [{}] })),
  };
};

export const osPopCodeStackAct = createOsAct<OsAct, PopCodeStackAct>(
  OsAct.OS_POP_CODE_STACK,
);
export interface PopCodeStackAct extends SyncAct<OsAct, { processKey: string }> {
  type: OsAct.OS_POP_CODE_STACK;
}
export const osPopCodeStackDef: SyncActDef<OsAct, PopCodeStackAct, State> = ({ processKey }, state) => ({
  ...state,
  proc: updateLookup(processKey, state.proc, ({ codeStack }) => ({
    codeStack: codeStack.slice(0, -1),
  })),
});

export const osPushCodeStackAct = createOsAct<OsAct, PushCodeStackAct>(
  OsAct.OS_PUSH_CODE_STACK,
);
interface PushCodeStackAct extends SyncAct<OsAct, { processKey: string; item: CodeStackItem }> {
  type: OsAct.OS_PUSH_CODE_STACK;
}
export const osPushCodeStackDef: SyncActDef<OsAct, PushCodeStackAct, State> = ({ processKey, item }, state) => ({
  ...state,
  proc: updateLookup(processKey, state.proc, ({ codeStack }) => ({
    codeStack: codeStack.concat(item),
  })),
});

/**
 * Register previously created process.
 */
export const osRegisterProcessAct = createOsAct<OsAct, RegisterProcessAct>(
  OsAct.OS_REGISTER_PROCESS,
);
interface RegisterProcessAct extends SyncAct<OsAct, {
  sessionKey: string;
  processKey: string;
  /**
   * Must specify user. The cwd defaults to user's home directory
   * if the user is different from the parent process's user.
   */
  userKey: string;
  unregisteredProcess: UnregisteredProcess;
  fdToOpenKey: FromFdToOpenKey;
  /**
   * null iff registering process 'init'.
   * Otherwise must be {processGroupKey} of parent process.
   */
  parentPgKey: null | string;
}> {
  type: OsAct.OS_REGISTER_PROCESS;
}
export const osRegisterProcessDef: SyncActDef<OsAct, RegisterProcessAct, State> = (payload, state) => {
  const { sessionKey, processKey, userKey, parentPgKey, unregisteredProcess, fdToOpenKey } = payload;
  const { proc, aux: { nextPid }, procGrp } = state;

  const newProc: ProcessState = {
    ...unregisteredProcess,
    buffer: [],
    childCount: 0,
    codeStack: [],
    command: null,
    fdToOpenKey: { ...fdToOpenKey },
    key: processKey,
    lastExitCode: null,
    lastBgKey: null,
    nestedRedirs: [
      // Initially the same as fdToOpenKey.
      { ...fdToOpenKey },
    ],
    pid: nextPid,
    processGroupKey: parentPgKey || 'init',
    sessionKey,
    sigHandler: {},
    tryResolveWait: null,
    userKey,
  };

  // Increment parent's childCount, unless registering 'init'.
  const updatedProc = parentPgKey
    && updateLookup(unregisteredProcess.parentKey, proc, ({ childCount }) => ({ childCount: childCount + 1 }))
    || null;

  return {
    ...state,
    aux: { ...state.aux, nextPid: nextPid + 1 },
    proc: updatedProc ? addToLookup(newProc, updatedProc) : addToLookup(newProc, proc),
    procGrp: parentPgKey
      // Add process to inherited process group.
      ? updateLookup<OsProcGroup>(parentPgKey, procGrp, ({ procKeys }) =>
        ({ procKeys: procKeys.concat(processKey) }))
      // Create new process group 'init' with same PGID as init's PID.
      : addToLookup<OsProcGroup>({ key: 'init', pgid: 1, procKeys: [processKey] }, procGrp),
  };
};

/**
 * Set process group of {processKey}, where {processGroupKey} must be the key of an
 * extant process e.g. {processKey}.
 * Remove {processKey} from previous process group, removing whole group if now empty.
 * If {processGroupKey} n'exist pas, create singleton process group, else add to existing one.
 */
export const osSetProcessGroupAct = createOsAct<OsAct, SetProcessGroupAct>(OsAct.OS_SET_PROCESS_GROUP);
interface SetProcessGroupAct extends SyncAct<OsAct, { processKey: string; processGroupKey: string }> {
  type: OsAct.OS_SET_PROCESS_GROUP;
}
export const osSetProcessGroupDef: SyncActDef<OsAct, SetProcessGroupAct, State> = ({ processGroupKey, processKey }, state) => {
  const { proc, procGrp, session } = state;
  const { sessionKey, pid, processGroupKey: prevPgKey } = proc[processKey];

  if (prevPgKey === processGroupKey) {
    return state;// Do nothing.
  }
  // Previous process group a singleton?
  const prevPgSingleton = procGrp[prevPgKey].procKeys.length === 1;
  // Remove previous group, or process from previous group.
  const cleanProcGrp = prevPgSingleton
    ? removeFromLookup(prevPgKey, procGrp)
    : updateLookup(prevPgKey, procGrp, ({ procKeys }) => ({ procKeys: procKeys.filter((key) => key !== processKey) }));
  /**
   * Update process groups in session, i.e. ensure {processGroupKey},
   * removing previous group if now empty.
   */
  const nextSessionPgs = ensureArrayItem(
    prevPgSingleton
      ? session[sessionKey].procGrps.filter((key) => key !== prevPgKey)
      : session[sessionKey].procGrps,
    processGroupKey,
  );
  
  return { ...state,
    // Update process's state.
    proc: updateLookup(processKey, proc, () => ({ processGroupKey })),
    // Update or create new process group, based on `cleanProcGrp`.
    procGrp: processGroupKey in cleanProcGrp
      ? updateLookup(processGroupKey, cleanProcGrp, ({ procKeys }) =>
        ({ procKeys: ensureArrayItem(procKeys, processKey) }))
      : addToLookup<OsProcGroup>(// Create new process group.
        { key: processGroupKey, pgid: pid, procKeys: [processKey] },
        cleanProcGrp,
      ),
    session: updateLookup(sessionKey, session, () => ({ procGrps: nextSessionPgs })),
  };
};

/**
 * Tell process how to handle a specified signal.
 */
export const osSetSignalHandlerAct = createOsAct<OsAct, SetSignalHandlerAct>(
  OsAct.OS_SET_SIGNAL_HANDLER,
);
interface SetSignalHandlerAct extends SyncAct<OsAct, { processKey: string; handler: ProcessSigHandler }> {
  type: OsAct.OS_SET_SIGNAL_HANDLER;
}
export const osSetSignalHandlerDef: SyncActDef<OsAct, SetSignalHandlerAct, State> = ({ processKey, handler }, state) => ({
  ...state,
  proc: updateLookup(processKey, state.proc, ({ sigHandler }) =>
    ({ sigHandler: { ...sigHandler, ...handler }  })),
});


/**
 * Store the subscription to the process's observable.
 * One can view subscribing as 'starting the process'.
 */
export const osStoreProcessSubscriptionAct = createOsAct<OsAct, StoreProcessSubscriptionAct>(
  OsAct.OS_STORE_PROCESS_SUBSCRIPTION,
);
interface StoreProcessSubscriptionAct extends SyncAct<OsAct, { processKey: string; subscription: Subscription }> {
  type: OsAct.OS_STORE_PROCESS_SUBSCRIPTION;
}
export const osStoreProcessSubscriptionDef: SyncActDef<OsAct, StoreProcessSubscriptionAct, State> = ({ processKey, subscription }, state) => ({
  ...state,
  proc: updateLookup(processKey, state.proc, () => ({ subscription })),
});

/**
 * Store last exit code.
 */
export const osStoreExitCodeAct = createOsAct<OsAct, StoreExitCodeAct>(
  OsAct.OS_STORE_EXIT_CODE,
);
interface StoreExitCodeAct extends SyncAct<OsAct, { processKey: string; exitCode: number }> {
  type: OsAct.OS_STORE_EXIT_CODE;
}
export const osStoreExitCodeDef: SyncActDef<OsAct, StoreExitCodeAct, State> = ({ exitCode, processKey }, state) => ({
  ...state,
  proc: updateLookup(processKey, state.proc, () => ({ lastExitCode: exitCode })),
});

/**
 * Unregister process.
 */
export const osUnregisterProcessAct = createOsAct<OsAct, UnregisterProcessAct>(
  OsAct.OS_UNREGISTER_PROCESS,
);
export const osUnregisterProcessDef: SyncActDef<OsAct, UnregisterProcessAct, State> = ({ processKey }, state) => {
  const { processGroupKey, sessionKey } = state.proc[processKey];
  const { procKeys } = state.procGrp[processGroupKey];

  return { ...state,
    proc: removeFromLookup(processKey, state.proc),
    procGrp: procKeys.length === 1
      // Remove empty process group.
      ? removeFromLookup(processGroupKey, state.procGrp)
      // Remove process from process group.
      : updateLookup(processGroupKey, state.procGrp, () =>
        ({ procKeys: procKeys.filter((key) => key !== processKey) })
      ),
    /**
     * Remove empty process group from session,
     * i.e. from {procGrps} and foreground stack.
     */
    session: procKeys.length === 1
      ? updateLookup(sessionKey, state.session, ({ procGrps, fgStack }) => ({
        procGrps: procGrps.filter((key) => key !== processGroupKey),
        fgStack: fgStack.filter((key) => key !== processGroupKey),
      }))
      : state.session,
  };
};

interface UnregisterProcessAct extends SyncAct<OsAct, { processKey: string }> {
  type: OsAct.OS_UNREGISTER_PROCESS;
}

/**
 * Update process state.
 */
export const osUpdateProcessAct = createOsAct<OsAct, UpdateProcessAct>(
  OsAct.OS_UPDATE_PROCESS,
);
interface UpdateProcessAct extends SyncAct<OsAct, { processKey: string; updater: ReduxUpdater<ProcessState> }> {
  type: OsAct.OS_UPDATE_PROCESS;
}
export const osUpdateProcessDef: SyncActDef<OsAct, UpdateProcessAct, State> = ({ processKey, updater }, state) => ({
  ...state,
  proc: updateLookup(processKey, state.proc, updater),
});

export type Thunk = (
  | ExecTermThunk
  | FindAncestralProcessThunk
  | ForkProcessThunk
  | GetProcessThunk
  | GetProcessesMetaThunk
  | IsSessionLeaderThunk
  | SpawnChildThunk
  | StartProcessThunk
  | TerminateProcessThunk
  | WaiterThunk
  | WriteWarningThunk
);

/**
 * Replace process's Term and compile.
 * Moreover stop previous code if running.
 */
export const osExecTermThunk = createOsThunk<OsAct, ExecTermThunk>(
  OsAct.OS_EXEC_TERM_THUNK,
  ( { dispatch, state: { os: { proc } }, service },
    { processKey, term: execTerm, command = null },
  ) => {

    const cloned = service.term.cloneTerm(execTerm);
    const term = service.term.eliminateSubshell(cloned);
    const observable = service.term.compile({ term, dispatch, processKey });

    if (proc[processKey].subscription) {// Stop running code.
      (proc[processKey].subscription as Subscription).unsubscribe();
    }

    dispatch(osUpdateProcessAct({ processKey,
      updater: ({ nestedRedirs, nestedVars }) => ({
        term: redact(term, 'Term'),
        observable: redact(observable, 'Observable'),
        subscription: null,
        sigHandler: {},
        // Reset wait-handlers.
        tryResolveWait: null,
        // Reset redirections, although could've changed via `exec >foo`.
        nestedRedirs: [{ ...last(nestedRedirs) }],
        fdToOpenKey: { ...last(nestedRedirs) },
        // Restrict to vars in earliest scope i.e. ignore local variables.
        nestedVars: [{ ...last(nestedVars) }],
        // Clear code stack.
        codeStack: [],
        command,
      }),
    }));
  },
);

interface ExecTermThunk extends OsThunkAct<OsAct, {
  processKey: string;
  term: Term;
  command: string | null;
}, void> {
  type: OsAct.OS_EXEC_TERM_THUNK;
}

export const osFindAncestralProcessThunk = createOsThunk<OsAct, FindAncestralProcessThunk>(
  OsAct.OS_FIND_ANCESTRAL_PROCESS_THUNK,
  ({ state: { os: { proc } } }, { predicate, processKey }) => {
    let process = proc[processKey];
    // Since our 'init' is its own parent we terminate on self-parent
    while (process !== (process = proc[process.parentKey])) {
      if (predicate(process)) return process;
    }
    return null;
  },
);

interface FindAncestralProcessThunk extends OsThunkAct<OsAct, {
  processKey: string;
  predicate: (state: ProcessState) => boolean;
}, ProcessState | null> {
  type: OsAct.OS_FIND_ANCESTRAL_PROCESS_THUNK;
}

/**
 * Fork a process.
 */
export const osForkProcessThunk = createOsThunk<OsAct, ForkProcessThunk>(
  OsAct.OS_FORK_PROCESS_THUNK,
  ( { state: { os: { proc }}, dispatch, service },
    { processKey, parentKey },
  ) => {

    if (proc[processKey]) {
      throw new TermError(`Cannot fork '${parentKey}' as extant '${processKey}'`, 2, 'P_EXIST');
    } else if (!proc[parentKey]) {
      throw new TermError(`Cannot fork non-extant '${parentKey}' as '${processKey}'`, 2, 'PP_NO_EXIST');
    }
    const {
      term: parentTerm, nestedVars, toFunc, sessionKey,
      userKey, fdToOpenKey, processGroupKey,
    } = proc[parentKey];
    /**
     * Create unregistered process.
     * Recompile parent's code, although will replace via exec.
     */
    const term = service.term.cloneTerm(parentTerm);
    const observable = service.term.compile({ term, dispatch, processKey });
    const unregisteredProcess: UnregisteredProcess = {
      parentKey,
      term: redact(term, 'Term'),
      observable: redact(observable, 'Observable'),
      subscription: null,
      nestedVars: nestedVars
        .map((toVar) => mapValues(toVar, (procVar) => cloneVar(procVar))),
      toFunc: mapValues(toFunc, (func) => service.term.cloneFunc(func)),
    };
    /**
     * Register under {processKey}, inheriting session, owner, open files, process group,
     * term (cloned), environment vars (cloned), functions (cloned).
     */
    dispatch(osRegisterProcessAct({
      processKey,
      sessionKey,
      userKey,
      // Inherit open files.
      fdToOpenKey: { ...fdToOpenKey },
      unregisteredProcess,
      // Process group always inherited on fork.
      parentPgKey: processGroupKey,
    }));

    // Increment numLinks of open files.
    Object.values(fdToOpenKey).forEach((openKey) => dispatch(osIncrementOpenAct({ openKey })));
  },
);
interface ForkProcessThunk extends OsThunkAct<OsAct, { parentKey: string; processKey: string }, void> {
  type: OsAct.OS_FORK_PROCESS_THUNK;
}

/**
 * Get {ProcessState} by {processKey}.
 * Technically could return null, but don't type this.
 * Used by {osReadThunk} to check if blocked process has since terminated.
 */
export const osGetProcessThunk = createOsThunk<OsAct, GetProcessThunk>(
  OsAct.OS_GET_PROCESS_THUNK,
  ({ state: { os: { proc }}}, { processKey }) => proc[processKey] || null,
);
interface GetProcessThunk extends OsThunkAct<OsAct, { processKey: string }, ProcessState> {
  type: OsAct.OS_GET_PROCESS_THUNK;
}

/**
 * Get info about all processes.
 */
export const osGetProcessesMeta = createOsThunk<OsAct, GetProcessesMetaThunk>(
  OsAct.OS_GET_PROCESSES_META_THUNK,
  ({ state: { os: { proc, session }}, dispatch }) => {
    return {
      metas: Object.values(proc).map(({ pid, sessionKey, term, command: launchedCommand }) => {
        const { ttyPath } = session[sessionKey];

        let command = '';
        if (pid === 1) {
          command = '(init)';
        } else if (launchedCommand) {
          command = launchedCommand;
        } else {
          command = dispatch(osGetHistoricalSrc({ term }));
        }

        return {
          pid,
          command,
          ttyName: ttyPath?.split('/').pop() || null,
        };
      })
    };
  },
);
interface GetProcessesMetaThunk extends OsThunkAct<OsAct, {}, { metas: ProcMeta[] }> {
  type: OsAct.OS_GET_PROCESSES_META_THUNK;
}
interface ProcMeta {
  pid: number;
  ttyName: string | null;
  command: string;
}

/**
 * Is {processKey} the session leader?
 */
export const osIsSessionLeaderThunk = createOsThunk<OsAct, IsSessionLeaderThunk>(
  OsAct.OS_IS_SESSION_LEADER_THUNK,
  ({ state: { os } }, { processKey }) => {
    const { sessionKey } = os.proc[processKey];
    return processKey === os.session[sessionKey].processKey;
  },
);
interface IsSessionLeaderThunk extends OsThunkAct<OsAct, { processKey: string }, boolean> {
  type: OsAct.OS_IS_SESSION_LEADER_THUNK;
}

/**
 * Given {term}, spawn and start a child process.
 */
export const osSpawnChildThunk = createOsThunk<OsAct, SpawnChildThunk>(
  OsAct.OS_SPAWN_CHILD_THUNK,
  (
    { dispatch, state: { os } },
    { processKey, childProcessKey, term, redirects, posPositionals,
      background = false, suspend = false, specPgKey, subshell = false, exportVars = [], command = null },
  ) => {
    // Fork {processKey} as {childProcessKey}
    dispatch(osForkProcessThunk({ parentKey: processKey, processKey: childProcessKey }));
    // Apply any explicit redirections (as opposed to {RedirectComposite})
    redirects.forEach(({ fd, mode, path }) =>
      dispatch(osOpenFileThunk({ processKey: childProcessKey, request: { fd, mode, path } }))
    );

    if (specPgKey) {
      // Add to specified process group
      dispatch(osSetProcessGroupAct({ processKey: childProcessKey, processGroupKey: specPgKey }));
      if (!background) {
        // Assume not in background means in session foreground
        dispatch(osSetSessionForegroundAct({ processKey, processGroupKey: specPgKey }));
      }
    } else if (background) {
      // If parent in session foreground, create new process group for child
      const { sessionKey, processGroupKey } = os.proc[processKey];
      const { fgStack } = os.session[sessionKey];
      if (fgStack.length && (processGroupKey === last(fgStack))) {
        dispatch(osSetProcessGroupAct({ processKey: childProcessKey, processGroupKey: childProcessKey }));
      }
    }

    if (subshell) {
      /**
       * Subshells inherit everything (cloned) including positional params.
       * They are also endowed with BASHPID because $$ won't be their pid.
       */
      const childPid = dispatch(osGetProcessThunk({ processKey: childProcessKey })).pid;
      dispatch(osAssignVarThunk({
        processKey: childProcessKey,
        varName: 'BASHPID',
        exported: true, readonly: true, force: true, integer: true,
        act: { key: 'default', value: childPid.toString() },
      }));
    } else {
      // Restrict child process to environment vars/functions, and set positionals
      dispatch(osRestrictToEnvThunk({ processKey: childProcessKey, posPositionals }));
    }
    // Export specified variables into child process
    for (const { varName, varValue } of exportVars) {
      dispatch(osAssignVarThunk({
        processKey: childProcessKey,
        varName,
        act: { key: 'default', value: varValue },
        exported: true,
      }));
    }
    // Replace cloned process with specified code
    dispatch(osExecTermThunk({ processKey: childProcessKey, term, command }));

    if (!suspend) {
      // Start child process
      dispatch(osStartProcessThunk({ processKey: childProcessKey }));
    }
    if (!background) {
      // Wait for child to terminate
      return { ...dispatch(osWaiterThunk({ processKey, waitFor: [childProcessKey] })) };
    }
    // Inform parent of last background child
    dispatch(osUpdateProcessAct({ processKey, updater: () => ({ lastBgKey: childProcessKey }) }));
    return { toPromise: null };
  },
);

export interface SpawnChildThunk extends OsThunkAct<OsAct,
{ processKey: string } & SpawnChildDef,
{ toPromise: IoToPromise }
> {
  type: OsAct.OS_SPAWN_CHILD_THUNK;
}

export interface SpawnChildDef extends BaseSpawnDef {
  /**
   * The key of the process we'll spawn.
   */
  childProcessKey: string;
  /**
   * Spawn in background? Default is false.
   * - If false suspend parent until child terminates.
   * - Otherwise don't suspend parent.
   */
  background?: boolean;
  /**
   * Suspend process initially? Default is false.
   */
  suspend?: boolean;
  /**
   * Optionally specify process group.
   * - For pipelines use processKey of final child.
   * - For simple commands use processKey.
   *
   * Must specify here for foreground processes,
   * otherwise the process will have terminated.
   */
  specPgKey?: string;
  /**
   * Are we spawning a subshell?
   * Default is false.
   */
  subshell?: boolean;
  /**
   * Exported variables to be created.
   */
  exportVars?: { varName: string; varValue: string }[];
  /**
   * Command which 'launched' this process.
   */
  command?: string;
  // /**
  //  * Attached source to propagate.
  //  */
  // src?: string;
}
export interface BaseSpawnDef {
  /** Process definition. */
  term: Term;
  /**
   * Specified redirects, e.g. to implement pipelines,
   * not for interpreting user code.
   */
  redirects: {
    fd: number;
    mode: OpenFileRequest['mode'];
    path: string;
  }[];
  /**
   * Contiguous values of positive positional variables i.e. from $1,
   * so that {positionals[0]} is the value of $1.
   */
  posPositionals: string[];
}

export const osWriteWarningThunk = createOsThunk<OsAct, WriteWarningThunk>(
  OsAct.OS_WRITE_WARNING,
  async ({ dispatch }, { processKey, line, term }) => {
    const zeroethParam = dispatch(osExpandVarThunk({ processKey, varName: '0' }));
    let warning: string;

    switch (term.key) {
      case CompositeType.binary: {
        warning = dispatch(osIsSessionLeaderThunk({ processKey }))
          ? `${zeroethParam}: ${line}` // Prevent erroneous '-bash: bash: ...'.
          : `${term.binaryKey}: ${line}`;
        break;
      }
      case CompositeType.builtin:
      case CompositeType.declare: {
        warning = `${zeroethParam}: ${builtinKeyToCommand(term.builtinKey)}: ${line}`;
        break;
      }
      default: warning = `${zeroethParam}: ${line}`;
    }

    let result: { toPromise: IoToPromise };
    while ((result = await dispatch(osWriteThunk({ fd: 2, lines: [warning], processKey }))) && result.toPromise) {
      await result.toPromise();
    }
  },
);
interface WriteWarningThunk extends OsThunkAct<OsAct,
{ processKey: string; line: string; term: Term },
Promise<void>
> {
  type: OsAct.OS_WRITE_WARNING;
}

/**
 * Start process by subscribing to ReplaySubject wrapping an iterator.
 * Handle its yielded actions, and then iterate the iterator it wraps.
 * https://itnext.io/lossless-backpressure-in-rxjs-b6de30a1b6d4
 */
export const osStartProcessThunk = createOsThunk<OsAct, StartProcessThunk>(
  OsAct.OS_START_PROCESS_THUNK,
  ({ state: { os: { proc } }, dispatch }, { processKey }) => {
    const { observable, subscription } = proc[processKey];

    if (!subscription) {
      const newSubscription = observable.subscribe({
        next: async (act) => {// Handle actions yielded by terms.
          // console.log({ processKey, act }); // DEBUG

          if (act) {
            switch (act.key) {
              case 'enter': {
                act.term.onEnter();
                break;
              }
              case 'warn': {
                await dispatch(osWriteWarningThunk({ processKey, line: act.line, term: act.term}));
                break;
              }
              case 'exit': {// NOTE actual term exit enforced in {*iterateTerm}.
                if (act.term.key === CompositeType.simple || act.term.key === CompositeType.compound) {
                  // These terms correspond to commands.
                  dispatch(osStoreExitCodeAct({ processKey, exitCode: act.code }));
                }
                // Store code in term so ancestors can use it.
                act.term.exitCode = act.code;
                if (act.line) {
                  await dispatch(osWriteWarningThunk({ processKey, line: act.line, term: act.term}));
                }
                break;
              }
              case 'read': {
                /**
                 * Attempt a single read, blocking if necessary.
                 */
                const { eof, toPromise } = dispatch(osReadThunk({ fd: act.fd, maxLines: act.maxLines, processKey, buffer: act.buffer }));
                if (toPromise) {
                  await toPromise();
                }
                /**
                 * Push {false} iff reached EOF.
                 */
                return observable.push(!eof);
              }
              case 'write': {
                /**
                 * Block until {lines} or process buffer written.
                 */
                let result: { toPromise: IoToPromise };
                while ((result = await dispatch(osWriteThunk({ fd: act.fd, lines: act.lines, processKey }))) && result.toPromise) {
                  await result.toPromise();
                }
                break;
              }
              default: throw testNever(act);
            }
          }
          /**
           * Iterate the wrapped iterator.
           * We only push a value in 'read' above.
           */
          observable.push();
        },
        complete: () => {
          /**
           * Terminate process on completion.
           */
          console.log({ processKey, event: 'completed' });
          const exitCode = dispatch(osGetProcessThunk({ processKey })).lastExitCode || 0;
          dispatch(osTerminateProcessThunk({ processKey, exitCode }));
        },
        error: (err) => {
          /**
           * TODO remove process on internal error?
           */
          console.log({ processKey, event: 'error', err });
        },
      });

      dispatch(osStoreProcessSubscriptionAct({
        processKey,
        subscription: redact(newSubscription, Subscription.name),
      }));
    }
  },
);
interface StartProcessThunk extends OsThunkAct<OsAct, { processKey: string }, void> {
  type: OsAct.OS_START_PROCESS_THUNK;
}

/**
 * Terminate a process.
 */
export const osTerminateProcessThunk = createOsThunk<OsAct, TerminateProcessThunk>(
  OsAct.OS_TERMINATE_PROCESS_THUNK,
  ({ dispatch, state: { os } }, { processKey, exitCode }) => {
    if (!os.proc[processKey]) {
      return console.log(`process '${processKey}' has already terminated`);
    }

    dispatch(osCloseProcessFdsAct({ processKey }));
    // Stop any running code
    os.proc[processKey].subscription?.unsubscribe();
    // Terminate any spawned processes
    Object.values(os.proc)
      .filter(({ parentKey }) => processKey === parentKey)
      .forEach(({ key }) => dispatch(osTerminateProcessThunk({ processKey: key, exitCode: 0 })));
    // TODO terminate descendants if implement non-interactive bash?

    dispatch(osUnregisterProcessAct({ processKey }));
    console.log(`[\x1b[36m${processKey}\x1b[39m] has terminated.`);

    const { parentKey } = os.proc[processKey];
    if (!os.proc[parentKey]) {// Parent already terminated.
      return;
    }
    dispatch(osUpdateProcessAct({ processKey: parentKey,
      updater: ({ childCount: c }) => ({ childCount: c - 1, lastExitCode: exitCode }),
    }));

    const { tryResolveWait } = os.proc[parentKey];
    if (tryResolveWait) {// Inform waiting parent that child terminated.
      tryResolveWait(processKey);
    } else {/* Was not waiting, or was but has since been exec'd. */}
  },
);
interface TerminateProcessThunk extends OsThunkAct<OsAct, { processKey: string; exitCode: number }, void> {
  type: OsAct.OS_TERMINATE_PROCESS_THUNK;
}

/**
 * Compute {toPromise} which, when resolved, ensures this process
 * waits for specified child processes to terminate.
 * 
 * Relies upon {tryResolveWait} being invoked upon termination of each child.
 */
export const osWaiterThunk = createOsThunk<OsAct, WaiterThunk>(
  OsAct.OS_WAITER_THUNK,
  ({ dispatch, state: { os } }, { processKey, waitFor }) => {

    if (Array.isArray(waitFor)) {
      // Avoid case where child process(es) already terminated.
      waitFor = waitFor.filter((childKey) => os.proc[childKey]);
      if (!waitFor.length) {
        return { toPromise: null };
      }
    }

    // Store {tryResolveWait} in process state.
    const toPromise = () => new Promise<void>((resolve, _) => {
      dispatch(osUpdateProcessAct({
        processKey,
        updater: () => ({
          tryResolveWait: (childKey: string) => {
            if (Array.isArray(waitFor)) {
              waitFor = waitFor.filter((x) => x !== childKey);
              if (waitFor.length) {
                return; // Some specified child hasn't terminated.
              }
            } else if (waitFor === 'all') {
              const { childCount } = dispatch(osGetProcessThunk({ processKey }));
              if (childCount) {
                return; // Some child hasn't terminated.
              }
            }
            resolve();// Resume this process.
            dispatch(osUpdateProcessAct({ processKey, updater: () => ({ tryResolveWait: null }) }));
          },
        })
      }));
    });

    return { toPromise };
  },
);
interface WaiterThunk extends OsThunkAct<OsAct, { processKey: string } & WaitDef, { toPromise: IoToPromise }> {
  type: OsAct.OS_WAITER_THUNK;
}
interface WaitDef {
  waitFor: string[] | 'all' | 'next';
}
