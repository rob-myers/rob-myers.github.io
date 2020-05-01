import { keys } from '@model/generic.model';

export enum OsAct {
  OS_ADD_FUNCTION= 'OS_ADD_FUNCTION',
  /**
   * Clear temp buffer of process.
   */
  OS_CLEAR_PROCESS_BUFFER= 'OS_CLEAR_PROCESS_BUFFER',
  OS_CLEAR_TTY_THUNK= 'OS_CLEAR_TTY_THUNK',
  /**
   * Clone a term.
   */
  OS_CLONE_TERM_THUNK= 'OS_CLONE_TERM_THUNK',
  /**
   * Close a file descriptor in a process.
   */
  OS_CLOSE_FD= 'OS_CLOSE_FD',
  OS_CREATE_BINARY_THUNK= 'OS_CREATE_BINARY_THUNK',
  OS_CREATE_BUILTIN_THUNK= 'OS_CREATE_BUILTIN_THUNK',
  /**
   * Create a new terminal device.
   */
  OS_CREATE_TTY_THUNK= 'OS_CREATE_TTY_THUNK',
  /**
   * Create login session.
   */
  OS_CREATE_SESSION_THUNK= 'OS_CREATE_SESSION_THUNK',
  OS_DISTRIBUTE_SRC_THUNK= 'OS_DISTRIBUTE_SRC_THUNK',
  /**
   * Duplicate a file descriptor in a process.
   */
  OS_DUP_FD= 'OS_DUP_FD',
  OS_END_SESSION_THUNK= 'OS_END_SESSION_THUNK',
  /**
   * Exec forked process with specified code.
   */
  OS_EXEC_TERM_THUNK= 'OS_EXEC_TERM_THUNK',
  OS_EXPAND_FILEPATH_THUNK= 'OS_EXPAND_FILEPATH_THUNK',
  OS_FIND_ANCESTRAL_PROCESS_THUNK= 'OS_FIND_ANCESTRAL_PROCESS_THUNK',
  OS_FIND_VAR_NAMES_THUNK= 'OS_FIND_VAR_NAMES_THUNK',
  OS_GET_FUNCTION_THUNK= 'OS_GET_FUNCTION_THUNK',
  OS_GET_FUNCTIONS_THUNK= 'OS_GET_FUNCTIONS_THUNK',
  OS_GET_POSITIONALS_THUNK= 'OS_GET_POSITIONALS_THUNK',
  OS_GET_PROCESSES_META_THUNK= 'OS_GET_PROCESSES_META_THUNK',
  /**
   * Get open file description linked to process.
   */
  OS_GET_OFD_THUNK= 'OS_GET_OFD_THUNK',
  OS_GET_VARS_THUNK= 'OS_GET_VARS_THUNK',
  OS_GO_HOME_THUNK= 'OS_GO_HOME_THUNK',
  OS_IS_A_TTY_THUNK= 'OS_IS_A_TTY_THUNK',
  OS_IS_LOGIN_SHELL= 'OS_IS_LOGIN_SHELL',
  /**
   * Is process the session leader?
   */
  OS_IS_SESSION_LEADER_THUNK= 'OS_IS_SESSION_LEADER_THUNK',
  OS_MAKE_DIR_THUNK= 'OS_MAKE_DIR_THUNK',
  OS_MAKE_FIFO_THUNK= 'OS_MAKE_FIFO_THUNK',
  /**
   * Offset open file description for regular file.
   */
  OS_OFFSET_OPEN= 'OS_OFFSET_OPEN',
  OS_OPEN_TEMP_THUNK= 'OS_OPEN_TEMP_THUNK',
  /**
   * Try to parse the lines in process buffer using bash parser.
   */
  OS_PARSE_BUFFER_THUNK= 'OS_PARSE_BUFFER_THUNK',
  OS_PARSE_SH_THUNK= 'OS_PARSE_SH_THUNK',
  OS_POP_POSITIONALS_SCOPE= 'OS_POP_POSITIONALS_SCOPE',
  OS_POP_REDIRECT_SCOPE= 'OS_POP_REDIRECT_SCOPE',
  /**
   * If stdout is a tty, send prompt to it.
   */
  OS_PROMPT_THUNK= 'OS_PROMPT_THUNK',
  OS_POP_CODE_STACK= 'OS_POP_CODE_STACK',
  OS_POP_VAR_SCOPE= 'OS_POP_VAR_SCOPE',
  OS_PUSH_CODE_STACK= 'OS_PUSH_CODE_STACK',
  OS_PUSH_POSITIONALS_SCOPE= 'OS_PUSH_POSITIONALS_SCOPE',
  OS_PUSH_VAR_SCOPE= 'OS_PUSH_VAR_SCOPE',
  /**
   * Try to read from an open file in a process into latter's buffer.
   */
  OS_READ_THUNK= 'OS_READ_THUNK',
  OS_REMOVE_DIR_THUNK= 'OS_REMOVE_DIR_THUNK',
  OS_REMOVE_FUNCTION_THUNK= 'OS_REMOVE_FUNCTION_THUNK',
  OS_RESOLVE_PATH_THUNK= 'OS_RESOLVE_PATH_THUNK',
  OS_RESTRICT_TO_ENV_THUNK= 'OS_RESTRICT_TO_ENV_THUNK',
  /**
   * Push redirection scope in process.
   */
  OS_PUSH_REDIRECT_SCOPE= 'OS_PUSH_REDIRECT_SCOPE',
  /**
   * Connect a process to an open file description.
   */
  OS_SET_FD= 'OS_SET_FD',
  OS_SET_POSITIONALS_SCOPE= 'OS_SET_POSITIONALS_SCOPE',
  /**
   * Set process group of process.
   */
  OS_SET_PROCESS_GROUP= 'OS_SET_PROCESS_GROUP',
  /**
   * Set owner of process.
   */
  OS_SET_PROCESS_UID= 'OS_SET_PROCESS_UID',
  /**
   * Set process owner and respective environment.
   */
  OS_SET_PROCESS_USER_THUNK= 'OS_SET_PROCESS_USER_THUNK',
  /**
   * Set foreground process group of session.
   */
  OS_SET_SESSION_FOREGROUND= 'OS_SET_SESSION_FOREGROUND',
  /**
   * Assign a specific signal handler to process.
   */
  OS_SET_SIGNAL_HANDLER= 'OS_SET_SIGNAL_HANDLER',
  /**
   * Set zeroeth positional parameter.
   */
  OS_SET_ZEROETH_PARAM= 'OS_SET_ZEROETH_PARAM_THUNK',
  OS_SHIFT_POSITIONALS= 'OS_SHIFT_POSITIONALS',
  OS_SPAWN_CHILD_THUNK= 'OS_SPAWN_CHILD_THUNK',
  /**
   * Start process i.e. subscribe to compiled observable.
   */
  OS_START_PROCESS_THUNK= 'OS_START_PROCESS_THUNK',
  /**
   * Store subscription to observable in process.
   */
  OS_STORE_PROCESS_SUBSCRIPTION= 'OS_STORE_PROCESS_SUBSCRIPTION',
  OS_TERMINATE_PROCESS_THUNK= 'OS_TERMINATE_PROCESS_THUNK',
  /**
   * Transpiled parsed shell code.
   */
  OS_TRANSPILE_SH_THUNK= 'OS_TRANSPILE_SH_THUNK',
  OS_UNLINK_FILE_THUNK= 'OS_UNLINK_FILE_THUNK',
  OS_UNREGISTER_PROCESS= 'OS_UNREGISTER_PROCESS',
  OS_UNREGISTER_SESSION= 'OS_UNREGISTER_SESSION',
  OS_UNSET_VAR_THUNK= 'OS_UNSET_VAR_THUNK',
  OS_UPDATE_FUNCTION= 'OS_UPDATE_FUNCTION',
  OS_UPDATE_PROCESS= 'OS_UPDATE_PROCESS',
  OS_UPDATE_PWD_THUNK= 'OS_UPDATE_PWD_THUNK',
  OS_WAITER_THUNK= 'OS_WAITER_THUNK',
  OS_WALK_TERM_THUNK= 'OS_WALK_TERM_THUNK',
  OS_WRITE_THUNK= 'OS_WRITE_THUNK',

  OS_SIGNAL_FOREGROUND_THUNK= 'OS_SIGNAL_FOREGROUND_THUNK',
  OS_MOUNT_FILE= 'OS_MOUNT_FILE',
  OS_INCREMENT_TTY_ID= 'OS_INCREMENT_TTY_ID',
  OS_INITIALIZE_THUNK= 'OS_INITIALIZE_THUNK',
  OS_REGISTER_SESSION= 'OS_REGISTER_SESSION',
  OS_INITIALIZED= 'OS_INITIALIZED',
  OS_STORE_LAST_PING= 'OS_STORE_LAST_PING',
  OS_RESET= 'OS_RESET',
  OS_ASSIGN_VAR_THUNK= 'OS_ASSIGN_VAR_THUNK',
  OS_GET_PROCESS_THUNK= 'OS_GET_PROCESS_THUNK',
  OS_GET_HISTORICAL_SRC= 'OS_GET_HISTORICAL_SRC',
  OS_UPDATE_NESTED_VAR= 'OS_UPDATE_NESTED_VAR',
  OS_EXPAND_VAR_THUNK= 'OS_EXPAND_VAR_THUNK',
  OS_LOOKUP_VAR_THUNK= 'OS_LOOKUP_VAR_THUNK',
  OS_STORE_EXIT_CODE= 'OS_STORE_EXIT_CODE',
  OS_SPAWN_INIT_THUNK= 'OS_SPAWN_INIT_THUNK',
  OS_REGISTER_PROCESS= 'OS_REGISTER_PROCESS',
  OS_CREATE_USER_THUNK= 'OS_CREATE_USER_THUNK',
  OS_CREATE_USER_GROUP= 'OS_CREATE_USER_GROUP',
  OS_REGISTER_USER= 'OS_REGISTER_USER',
  OS_FORK_PROCESS_THUNK= 'OS_FORK_PROCESS_THUNK',
  OS_INCREMENT_OPEN= 'OS_INCREMENT_OPEN',
  OS_CLOSE_PROCESS_FDS= 'OS_CLOSE_PROCESS_FDS',
  OS_OPEN_FILE_THUNK= 'OS_OPEN_FILE_THUNK',
  OS_REAL_PATH_THUNK= 'OS_REAL_PATH_THUNK',
  OS_ABS_PATH_THUNK= 'OS_ABS_PATH_THUNK',
  OS_ABS_TO_INODE= 'OS_ABS_TO_INODE',
  OS_REGISTER_OPEN_FILE= 'OS_REGISTER_OPEN_FILE',
  OS_WRITE_WARNING= 'OS_WRITE_WARNING',
}

/**
 * Process groups.
 */
export interface OsProcGroup {
  /**
   * Process group key.
   */
  key: string;
  /**
   * Legacy progress group id.
   */
  pgid: number;
  /**
   * Keys of processes in the group,
   * which has have not yet terminated.
   */
  procKeys: string[];
}

/**
 * A user group of the operating system.
 */
export interface OsUserGroup {
  key: string;
  /** Legacy user Group ID */
  gid: number;
}

/**
 * A user of the operating system.
 */
export interface OsUser<ExactUserKey extends string = string> {
  /**
   * Username.
   */
  key: ExactUserKey;
  /**
   * Legacy User ID.
   */
  uid: number;
  /**
   * Root user has home dir /root.
   * Other users have /home/{key}.
   */
  homeDir: string;
  /**
   * User groups the user is a member of.
   * Must contain {key}.
   */
  groupKeys: string[];
}

export enum TopLevelDirType {
  /** Devices directory. */
  dev= 'dev',
  /** Home directory of root user. */
  root= 'root',
  /** Contains home directories of non-root users. */
  home= 'home',
  /** Contains temporary files. */
  tmp= 'tmp',
  /** Binaries. */
  bin= 'bin',
  usr = 'usr',
}

export const topLevelDirs = keys(TopLevelDirType);

export type GetOpts<
  StringKey extends string = string,
  BooleanKey extends string = string
> = (
  & { [optName in Exclude<StringKey, '_' | BooleanKey>]: string; }
  & { [optName in Exclude<BooleanKey, '_' | StringKey>]: boolean; }
  & { '_': string[] }
)
