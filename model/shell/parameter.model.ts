export enum ParamType {
  case= 'case',
  default= 'default',
  keys= 'keys',
  length= 'length',
  plain= 'plain',
  pointer= 'pointer',
  position= 'position',
  replace= 'replace',
  remove= 'remove',
  special= 'special',
  substring= 'substring',
  vars= 'vars',
}

export type ParameterDef<WordType, OpType> = BaseParamDef<OpType> & (
  // Alphabetic case with letter pattern ${a^b}, ${a^^b}, ${a,b}, ${a,,b}.
  | { parKey: ParamType.case; pattern: null | WordType; to: 'upper' | 'lower'; all: boolean }
  // Default parameters.
  | { parKey: ParamType.default; alt: null | WordType; colon: boolean;
    symbol:
    | '+' // Use alternative.
    | '=' // Assign default.
    | '?' // indicate error.
    | '-';// Use default.
  }
  // Array keys ${!x[@]}, ${!x[*]}.
  | { parKey: ParamType.keys; split: boolean }
  // String length ${#x}, ${#x[i]}, ${#x[@]}
  | { parKey: ParamType.length; of: 'word' | 'values' }
  // Plain lookup ${x}, ${x[i]}, ${x[@]} or ${x[*]}
  | { parKey: ParamType.plain }
  // Indirection ${!x} or ${!x[y]}
  | { parKey: ParamType.pointer }
  // Positional $1, $2, ..., ${10}, ...
  | { parKey: ParamType.position }// param: 0 | 1 | 2 | ...
  // Remove pre/suffix ${x#y}, ${x##y}, ${x%%y}, ${x%y}
  | { parKey: ParamType.remove; pattern: null | WordType; dir: 1 | -1; greedy: boolean }
  // ${x/y/z}, ${x//y/z}, ${x[i]/y/z} // TODO one arg?
  | { parKey: ParamType.replace; orig: WordType; with: null | WordType; all: boolean }
  // Special $@ | $* | ...
  | { parKey: ParamType.special;
    // Removed '#@' and '#*'.
    param: '@' | '*' | '#' | '?' | '-' | '$' | '!' | '0' | '_'; }
  // Substring ${x:y:z}, ${x[i]:y:z}
  | { parKey: ParamType.substring; from: OpType; length: null | OpType }
  // Vars with given non-empty prefix ${!prefix*} or ${!prefix@}
  | { parKey: ParamType.vars; split: boolean }
)

export interface BaseParamDef<OpType> {
  /** Parameter name. */
  param: string;
  /** $a instead of ${a}. No default. */
  short?: boolean;
  /** Exists <=> accessing array/map item. */
  index?: OpType;
}
