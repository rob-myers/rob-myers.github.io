import { FileWithMeta } from "./parse.model";

export type ToProcVar = Record<string, ProcessVar>;

export type ProcessVar = BaseProcessVar & (
  | BasePositionalVar
  | { key: 'plain'; value: any }
  /** Must keep track of unset local variable */
  | { key: 'unset'; value: null }
);

export interface BaseProcessVar {
  varName: string;
  readonly: boolean;
  exported: boolean;
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
   * If `undefined` or `false` then assign to shallowest scope.
   * If `true` then assign to deepest scope.
   * Not a property of variable i.e. not in `BaseProcessVar`.
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

export interface AssignVarOpts extends Partial<BaseAssignOpts> {
  varName: string;
  value?: any;
  /**
   * Shell-based assignment? If so:
   * - `integer` is used and means integer-based
   * - `append` is used and means concat
   * - if array/map x=y assigns to index 0, x+=y appends 0-indexed
   */
  shell?: boolean;
  /** Internal variables needn't match varName regex */
  internal?: boolean;
  /** For array/object kv assignment */
  index?: string;
  append?: boolean;
}

/**
 * A variable and a function may have the same name.
 */
export type NamedFunction = {
  /** Function name. */
  key: string;
  /** Export function to child processes? */
  exported: boolean;
  /** Is this function readonly? */
  readonly: boolean;
  /** The source code of the body of the function, e.g. `{ echo foo; }` */
  src: null | string;
} & (
  | ShellFuncDef
  | JsFuncDef
)

export interface ShellFuncDef {
  type: 'shell';
  node: FileWithMeta;
}

export interface JsFuncDef {
  type: 'js';
  func: () => (v: Record<string, any>) => void | Promise<void>;
}
