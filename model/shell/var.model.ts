import { FileWithMeta, Stmt } from "./parse.service";

export type ToProcVar = Record<string, ProcessVar>;

/** `value` is null iff (a) declared but not set, or (b) unset */
export type ProcessVar = BaseProcessVar & (
  | BasePositionalVar
  | { key: 'string'; value: null | string }
  | { key: 'integer'; value: null | number }
  | { key: 'string[]'; value: null | string[] }
  | { key: 'integer[]'; value: null | number[] }
  | { key: 'to-string'; value: null | Record<string, string> }
  | { key: 'to-integer'; value: null | Record<string, number> }
  /** Must keep track of unset local variable */
  | { key: 'unset'; value: null }
);

export interface BaseProcessVar {
  varName: string;
  readonly: boolean;
  exported: boolean;
  /** null iff should not transform */
  to: null | 'lower' | 'upper';
}

export interface BasePositionalVar {
  key: 'positional';
  value: string;
  /** `1`-based index */
  index: number;
}

export interface BaseAssignOpts {
  array: boolean;
  associative: boolean;
  exported: boolean;
  integer: boolean;
  /** 
   * If {undefined} or {false} then assign to shallowest scope.
   * If {true} then assign to deepest scope.
   * Not a property of variable i.e. not in {BaseProcessVar}.
   */
  local: boolean;
  /** To lowercase on assign. */
  lower: boolean;
  readonly: boolean;
  /** To uppercase on assign. */
  upper: boolean;
  /** Forcibly overwrite readonly (internal use only) */
  force: boolean;
}

export interface AssignVarBase extends Partial<BaseAssignOpts> {
  varName: string;
  act: AssignVarAction;
}

/**
 * If `value` undefined then must be declaring.
 */
type AssignVarAction = (
  | { key: 'array'; value?: string[] }// ( a, b, c )
  | { key: 'item'; index: string; value?: string }// x[0]=foo, x[foo]=bar, x[foo]=
  | { key: 'default'; value?: string; append?: boolean }// string or integer.
  | { key: 'map'; value?: Record<string, string> }// ( [a]=1, [b]=2, [c]=3 )
);

export interface VarFlags {
  exported: boolean;
  readonly: boolean;
  /**
   * null iff should not transform.
   */
  to: null | 'lower' | 'upper';
}

/**
 * A variable and a function may have the same name.
 */
export interface NamedFunction {
  /** Function name. */
  key: string;
  /** Function definition. */
  node: FileWithMeta;
  // node: Stmt;
  /** Export function to child processes? */
  exported: boolean;
  /** Is this function readonly? */
  readonly: boolean;
  /** The source code of the body of the function, e.g. `{ echo foo; }` */
  src: null | string;
}
