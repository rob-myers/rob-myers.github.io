import { OsThunkAct, createOsThunk, createOsAct } from '@model/os/os.redux.model';
import { OsAct, OsUser } from '@model/os/os.model';
import { State } from '../os.duck';
import { SyncAct, SyncActDef, addToLookup, updateLookup } from '@model/redux.model';
import { osAssignVarThunk } from './declare.os.duck';
import { DirectoryINode } from '@store/inode/directory.inode';
import { osMountFileAct } from './file.os.duck';

export type Action = (
  | CreateUserGroupAct
  | RegisterUserAct
  | SetProcessUidAct
);

/**
 * Ensure user group.
 */
export const osCreateUserGroupAct = createOsAct<OsAct, CreateUserGroupAct>(
  OsAct.OS_CREATE_USER_GROUP,
);
interface CreateUserGroupAct extends SyncAct<OsAct, { groupKey: string }> {
  type: OsAct.OS_CREATE_USER_GROUP;
}
export const osCreateUserGroupDef: SyncActDef<OsAct, CreateUserGroupAct, State> = ({ groupKey }, state) => {
  if (groupKey in state.userGrp) {
    return state;
  }
  const { nextGid } = state.aux;
  return { ...state,
    userGrp: addToLookup({ key: groupKey, gid: nextGid }, state.userGrp),
    aux: { ...state.aux, nextGid: nextGid + 1 },
  };
};

/**
 * Ensure user is registered with state.
 */
export const osRegisterUserAct = createOsAct<OsAct, RegisterUserAct>(OsAct.OS_REGISTER_USER);
interface RegisterUserAct extends SyncAct<OsAct, {
  userKey: string;
  groupKeys: string[];
}> {
  type: OsAct.OS_REGISTER_USER;
}
export const osRegisterUserDef: SyncActDef<OsAct, RegisterUserAct, State> = ({ userKey, groupKeys }, state) => {
  const { user, aux: {nextUid} } = state;
  if (!user[userKey]) {
    const item: OsUser = {
      key: userKey,
      uid: nextUid,
      groupKeys: [userKey, ...groupKeys.filter((x) => x !== userKey)],
      /**
       * Root user has home folder /root, others have /home/{userKey}.
       */
      homeDir: (userKey === 'root') ? '/root' : `/home/${userKey}`,
    };
    return {
      ...state,
      aux: { ...state.aux, nextUid: nextUid + 1 },
      user: addToLookup(item, user),
    };
  }
  return state;
};

/**
 * Set owner of process.
 */
export const osSetProcessUidAct = createOsAct<OsAct, SetProcessUidAct>(OsAct.OS_SET_PROCESS_UID);
interface SetProcessUidAct extends SyncAct<OsAct, {
  processKey: string;
  userKey: string;
}> {
  type: OsAct.OS_SET_PROCESS_UID;
}
export const osSetProcessUidDef: SyncActDef<OsAct, SetProcessUidAct, State> = ({ processKey, userKey }, state) => ({
  ...state,
  proc: updateLookup(processKey, state.proc, () => ({ userKey })),
});

export type Thunk = (
  | CreateUserThunk
  | SetProcessUserThunk
);

/**
 * Ensure a user and user group of same name,
 * also creating the home directory.
 */
export const osCreateUserThunk = createOsThunk<OsAct, CreateUserThunk>(
  OsAct.OS_CREATE_USER_THUNK,
  ({ dispatch, state: { os }}, { userKey, groupKeys }) => {
    // Ensure user group exists
    dispatch(osCreateUserGroupAct({ groupKey: userKey }));

    // Ensure non-root user has home directory inside /home.
    if (userKey !== 'root') {
      const parent = os.root.to.home as DirectoryINode;
      if (!parent.to[userKey]) {
        const iNode = parent.createSubdir();
        dispatch(osMountFileAct({ filename: userKey, iNode, parent }));
      }
    }
    // Register user in state.
    dispatch(osRegisterUserAct({ userKey, groupKeys }));
  },
);
interface CreateUserThunk extends OsThunkAct<OsAct, { userKey: string; groupKeys: string[] }, void> {
  type: OsAct.OS_CREATE_USER_THUNK;
}


/**
 * Set process's {userKey} and environment variables HOME and PWD.
 */
export const osSetProcessUserThunk = createOsThunk<OsAct, SetProcessUserThunk>(
  OsAct.OS_SET_PROCESS_USER_THUNK,
  ({ dispatch, state: { os } }, { processKey, userKey }) => {
    dispatch(osSetProcessUidAct({ processKey, userKey }));

    const { homeDir } = os.user[userKey];
    dispatch(osAssignVarThunk({ processKey, varName: 'HOME', act: { key: 'default', value: homeDir }, exported: true }));
    dispatch(osAssignVarThunk({ processKey, varName: 'PWD', act: { key: 'default', value: homeDir }, exported: true }));
    dispatch(osAssignVarThunk({ processKey, varName: 'OLDPWD', act: { key: 'default', value: homeDir }, exported: true }));
    dispatch(osAssignVarThunk({ processKey, varName: 'USER', act: { key: 'default', value: userKey }, exported: true }));
    dispatch(osAssignVarThunk({ processKey, varName: 'PATH', act: { key: 'default', value: '/bin' }, exported: true }));
  },
);
  
interface SetProcessUserThunk extends OsThunkAct<OsAct, {
  processKey: string;
  userKey: string;
}, void> {
  type: OsAct.OS_SET_PROCESS_USER_THUNK;
}