import { Term } from './term.model';
import { ObservedType } from '@os-service/term.service';
import { Subscription, ReplaySubject } from 'rxjs';

export enum ProcessSignal {
  ABRT= 'ABRT',
  ALRM= 'ALRM',
  HUP= 'HUP',
  INT= 'INT',
  KILL= 'KILL',
  QUIT= 'QUIT',
  TERM= 'TERM',
}

/**
 * A spawned yet unregistered process.
 */
export interface UnregisteredProcess {
  /**
   * Parent process's identifier.
   */
  parentKey: string;
  /**
   * Definition of process.
   */
  term: Term;
  /**
   * - 1st item contains vars set in current scope (deepest).
   * - Last item is earliest scope, rest are induced by
   *   functions, builtins, and sourced-scripts.
   * - Key 0 (0th positional parameter) exists in scope iff
   *   earliest scope, or scope induced by function, sourced-script, or builtin.
   * - Thus to get positional parameters find 1st scope with 0.
   */
  nestedVars: ToProcVar[];
  /**
   * Function definitions.
   */
  toFunc: Record<string, NamedFunction>;
  /**
   * Compiled `term`.
   */
  observable: ReplaySubject<ObservedType> & {
    push: (value?: any) => Promise<void>;
  };
  /**
   * Running `term`.
   */
  subscription: null | Subscription;
}

/**
 * Spawned and registered process.
 */
export interface ProcessState extends UnregisteredProcess {
  /**
   * Temporary buffer.
   */
  buffer: string[];
  /**
   * Number of running child processes.
   */
  childCount: number;
  /**
   * Invoked functions and sourced scripts which have not ended,
   * in the order they were invoked/sourced.
   */
  codeStack: CodeStackItem[];
  /**
   * File descriptor to open key.
   */
  fdToOpenKey: FromFdToOpenKey;
  /**
   * Process key e.g. 'tty-4.bash-1.cat-2'
   */
  key: string;
  /**
   * Process key of last child executed in background.
   */
  lastBgKey: null | string;
  /**
   * Exit code of the most recent child to terminate.
   */
  lastExitCode: null | number;
  /**
   * Process code-blocks e.g while, if, for, {} have redirection scope.
   * The 1st item corresponds to the current scope, the last to the top-most
   * scope. An item has key {fd} iff {fd} was set (redirected) in its respective scope.
   */
  nestedRedirs: FromFdToOpenKey[];
  /**
   * Process ID.
   */
  pid: number;
  /**
   * Inherited from parent process, or is _init_.
   * It is changed e.g. for pipelines run in the foreground.
   */
  processGroupKey: string;
  /**
   * Session is inherited from parent.
   */
  sessionKey: string;
  /**
   * How signals should be handled.
   * By default, the process terminates.
   */
  sigHandler: ProcessSigHandler;
  /**
   * If non-null then process is suspended. This method is invoked
   * by every child process upon their termination.
   */
  tryResolveWait: null | ((childKey: string) => void);
  /**
   * Owner is inherited from parent,
   * or may be initially set e.g. for child of 'init'.
   */
  userKey: string;
}

export type ToProcVar = Record<string, ProcessVar>;

/**
 * {value} is null iff (a) declared but not set, or (b) unset.
 */
export type ProcessVar = BaseProcessVar & (
  | BasePositionalVar
  | { key: 'string'; value: null | string }
  | { key: 'integer'; value: null | number }
  | { key: 'string[]'; value: null | string[] }
  | { key: 'integer[]'; value: null | number[] }
  | { key: 'to-string'; value: null | Record<string, string> }
  | { key: 'to-integer'; value: null | Record<string, number> }
  /**
   * Must keep track of unset local variable.
   */
  | { key: 'unset'; value: null }
);

export interface BaseProcessVar {
  varName: string;
  readonly: boolean;
  exported: boolean;
  /**
   * null iff should not transform.
   */
  to: null | 'lower' | 'upper';
}

export interface BasePositionalVar {
  key: 'positional';
  value: string;
  /** `1`-based index */
  index: number;
}

export interface PositionalProcVar extends BaseProcessVar, BasePositionalVar {}

/**
 * A variable and a function may have the same name.
 */
export interface NamedFunction {
  /** Function name. */
  key: string;
  /** Function definition. */
  term: Term;
  /** Export function to child processes? */
  exported: boolean;
  /** Is this function readonly? */
  readonly: boolean;
  /** The source code of the body of the function, e.g. `{ echo foo; }` */
  src: null | string;
}

export type CodeStackItem = (
  | { key: 'function'; funcName: string; src: null | string }
  | { key: 'script'; scriptPath: string; src: null | string }
);

export type FromFdToOpenKey = Record<number, string>;

export type ProcessSigHandler = Partial<Record<ProcessSignal, {
  cleanup: null | (() => void);
  do: SignalHandlerKey;
}>>;

export type SignalHandlerKey = (
  // Default behaviour.
  | 'terminate'
  // Exec original definition.
  | 'reset'
  // Ignore signal.
  | 'ignore'
);

export interface VarFlags {
  exported: boolean;
  readonly: boolean;
  /**
   * null iff should not transform.
   */
  to: null | 'lower' | 'upper';
}
