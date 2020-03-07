import { 
  // ActionsObservable,
  // StateObservable,
  // ofType,
  combineEpics,
} from 'redux-observable';
// import { map, filter } from 'rxjs/operators';
import { testNever, KeyedLookup, deepClone } from '@model/generic.model';
import { OsSession, osIncrementTtyIdDef, osRegisterSessionDef, osSetSessionForegroundDef, osUnregisterSessionDef } from './session.os.duck';
import { OsAct, OsProcGroup, OsUserGroup, OsUser } from '@model/os/os.model';
import { ProcessState } from '@model/os/process.model';
import { OpenFileDescription } from '@model/os/file.model';
import { DirectoryINode } from '@store/inode/directory.inode';

export interface State {
  aux: {
    initialized: boolean;
    /** Legacy process id (PID). */
    nextPid: number;
    /** Legacy user id (UID). */
    nextUid: number;
    /** Legacy user group id (GID). */
    nextGid: number;
    /** Legacy tty id. */
    nextTtyId: number;
    /** Last ping in ms since epoch. */
    lastPingMs: null | number;
  };
  /**
   * Sessions.
   */
  session: KeyedLookup<OsSession, string>;
  /**
   * Processes.
   */
  proc: KeyedLookup<ProcessState, string>;
  /**
   * Process groups.
   */
  procGrp: KeyedLookup<OsProcGroup, string>;
  /**
   * User groups.
   */
  userGrp: KeyedLookup<OsUserGroup, string>;
  /**
   * Users.
   */
  user: KeyedLookup<OsUser, string>;
  /**
   * Open file descriptions.
   */
  ofd: KeyedLookup<OpenFileDescription, string>;
  /**
   * Root of filesystem.
   */
  root: DirectoryINode;
}

export const initialOsAux: State['aux'] = {
  initialized: false,
  nextPid: 1,
  nextUid: 0,
  nextGid: 0,
  nextTtyId: 1,
  lastPingMs: null,
};

export const osInitialState: State = {
  aux: deepClone(initialOsAux),
  session: {},
  proc: {},
  procGrp: {},
  userGrp: {},
  user: {},
  ofd: {},
  root: new DirectoryINode({ userKey: 'root', groupKey: 'root' }, null),
};

/**
 * Import actions etc. from files in subdirectory ./os.
 */
import { Action as DeclareAction, Thunk as DeclareThunk, osUpdateNestedVarDef, osSetZeroethParamDef, osPushRedirectScopeDef, osPopRedirectScopeDef, osPushPositionalsScopeDef, osPopPositionalsScopeDef, osPushVarScopeDef, osPopVarScopeDef, osUpdateFunctionDef, osAddFunctionDef, osShiftPositionalsDef } from './declare.os.duck';
import { Action as FileAction, Thunk as FileThunk, osMountFileDef, osIncrementOpenDef, osRegisterOpenFileDef, osSetFileDescriptorDef, osCloseFdDef, osDupFileDescriptorDef, osOffsetOpenDef } from './file.os.duck';
import { Action as InitAction, Thunk as InitThunk, osInitializedDef, osStoreLastPingDef } from './init.os.duck';
import { Action as ProcessAction, Thunk as ProcessThunk, osStoreExitCodeDef, osRegisterProcessDef, osCloseProcessFdsDef, osSetProcessGroupDef, osUpdateProcessDef, osSetSignalHandlerDef, osStoreProcessSubscriptionDef, osClearBufferDef, osPushCodeStackDef, osPopCodeStackDef, osUnregisterProcessDef } from './process.os.duck';
import { Action as SessionAction, Thunk as SessionThunk } from './session.os.duck';
import { Action as UserAction, Thunk as UserThunk, osCreateUserGroupDef, osRegisterUserDef, osSetProcessUidDef } from './user.os.duck';
import { Thunk as ParseThunk} from './parse.os.duck';

export type Action = (
  | DeclareAction
  | FileAction
  | InitAction
  | ProcessAction
  | SessionAction
  | UserAction
  );
  
export type Thunk = (
  | DeclareThunk
  | FileThunk
  | InitThunk
  | ProcessThunk
  | SessionThunk
  | UserThunk
  | ParseThunk
)

export function reducer(state: State = osInitialState, action: Action): State {
  switch (action.type) {
    case OsAct.OS_ADD_FUNCTION: {
      return osAddFunctionDef(action.pay, state);
    }
    case OsAct.OS_CLEAR_PROCESS_BUFFER: {
      return osClearBufferDef(action.pay, state);
    }
    case OsAct.OS_CLOSE_FD: {
      return osCloseFdDef(action.pay, state);
    }
    case OsAct.OS_CLOSE_PROCESS_FDS: {
      return osCloseProcessFdsDef(action.pay, state);
    }
    case OsAct.OS_CREATE_USER_GROUP: {
      return osCreateUserGroupDef(action.pay, state);
    }
    case OsAct.OS_DUP_FD: {
      return osDupFileDescriptorDef(action.pay, state);
    }
    case OsAct.OS_INCREMENT_OPEN: {
      return osIncrementOpenDef(action.pay, state);
    }
    case OsAct.OS_INCREMENT_TTY_ID: {
      return osIncrementTtyIdDef(action.pay, state);
    }
    case OsAct.OS_INITIALIZED: {
      return osInitializedDef(action.pay, state);
    }
    case OsAct.OS_MOUNT_FILE: {
      return osMountFileDef(action.pay, state);
    }
    case OsAct.OS_POP_CODE_STACK: {
      return osPopCodeStackDef(action.pay, state);
    }
    case OsAct.OS_POP_POSITIONALS_SCOPE: {
      return osPopPositionalsScopeDef(action.pay, state);
    }
    case OsAct.OS_POP_REDIRECT_SCOPE: {
      return osPopRedirectScopeDef(action.pay, state);
    }
    case OsAct.OS_POP_VAR_SCOPE: {
      return osPopVarScopeDef(action.pay, state);
    }
    case OsAct.OS_PUSH_CODE_STACK: {
      return osPushCodeStackDef(action.pay, state);
    }
    case OsAct.OS_PUSH_POSITIONALS_SCOPE: {
      return osPushPositionalsScopeDef(action.pay, state);
    }
    case OsAct.OS_PUSH_REDIRECT_SCOPE: {
      return osPushRedirectScopeDef(action.pay, state);
    }
    case OsAct.OS_PUSH_VAR_SCOPE: {
      return osPushVarScopeDef(action.pay, state);
    }
    case OsAct.OS_OFFSET_OPEN: {
      return osOffsetOpenDef(action.pay, state);
    }
    case OsAct.OS_REGISTER_OPEN_FILE: {
      return osRegisterOpenFileDef(action.pay, state);
    }
    case OsAct.OS_REGISTER_PROCESS: {
      return osRegisterProcessDef(action.pay, state);
    }
    case OsAct.OS_REGISTER_SESSION: {
      return osRegisterSessionDef(action.pay, state);
    }
    case OsAct.OS_REGISTER_USER: {
      return osRegisterUserDef(action.pay, state);
    }
    // case OsAct.OS_RESET: {
    //   return osResetDef(action.pay, state);
    // }
    case OsAct.OS_SET_FD: {
      return osSetFileDescriptorDef(action.pay, state);
    }
    case OsAct.OS_SET_PROCESS_GROUP: {
      return osSetProcessGroupDef(action.pay, state);
    }
    case OsAct.OS_SET_PROCESS_UID: {
      return osSetProcessUidDef(action.pay, state);
    }
    case OsAct.OS_SET_SESSION_FOREGROUND: {
      return osSetSessionForegroundDef(action.pay, state);
    }
    case OsAct.OS_SET_SIGNAL_HANDLER: {
      return osSetSignalHandlerDef(action.pay, state);
    }
    case OsAct.OS_SET_ZEROETH_PARAM: {
      return osSetZeroethParamDef(action.pay, state);
    }
    case OsAct.OS_SHIFT_POSITIONALS: {
      return osShiftPositionalsDef(action.pay, state);
    }
    case OsAct.OS_STORE_PROCESS_SUBSCRIPTION: {
      return osStoreProcessSubscriptionDef(action.pay, state);
    }
    case OsAct.OS_STORE_EXIT_CODE: {
      return osStoreExitCodeDef(action.pay, state);
    }
    case OsAct.OS_STORE_LAST_PING: {
      return osStoreLastPingDef(action.pay, state);
    }
    case OsAct.OS_UNREGISTER_PROCESS: {
      return osUnregisterProcessDef(action.pay, state);
    }
    case OsAct.OS_UNREGISTER_SESSION: {
      return osUnregisterSessionDef(action.pay, state);
    }
    case OsAct.OS_UPDATE_FUNCTION: {
      return osUpdateFunctionDef(action.pay, state);
    }
    case OsAct.OS_UPDATE_NESTED_VAR: {
      return osUpdateNestedVarDef(action.pay, state);
    }
    case OsAct.OS_UPDATE_PROCESS: {
      return osUpdateProcessDef(action.pay, state);
    }
    default: return state || testNever(action);
  }
}

// import { RootState, RootAction } from './reducer';

// /**
//  * On close panel, close respective session if exists.
//  */
// const sessionClosedEpic = (
//   action$: ActionsObservable<RootAction>,
//   $state: StateObservable<RootState>
// ) =>
//   action$.pipe(
//     ofType(LayoutAct.LAYOUT_PANEL_CLOSED),
//     /**
//      * Find session with respective panelKey.
//      */
//     map<LayoutPanelClosedAct, OsSession | undefined>(
//       ({ payload: { panelKey } }) =>
//         Object.values($state.value.os.session).find(s => s.panelKey === panelKey)
//     ),
//     /**
//      * Ensure extant session.
//      */
//     filter((x): x is OsSession => !!x),
//     /**
//      * End and remove the session.
//      */
//     map(({ key: sessionKey }) => osEndSessionThunk({ sessionKey }))
//   );

export const epic = combineEpics(
  // testEpic,
  // sessionClosedEpic,
);
