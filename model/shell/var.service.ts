import { testNever } from "@model/generic.model";

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

export function cloneVar(input: ProcessVar): ProcessVar {
  switch (input.key) {
    case 'integer': 
    case 'positional':
    case 'string':
    case 'unset': {
      return { ...input };
    }
    case 'string[]': return { ...input, value: input.value ? input.value.slice() : null };
    case 'integer[]': return { ...input, value: input.value ? input.value.slice() : null };
    case 'to-string': return { ...input, value: input.value ? { ...input.value } : null };
    case 'to-integer': return { ...input, value: input.value ? { ...input.value } : null };
    default: throw testNever(input);
  }
}
