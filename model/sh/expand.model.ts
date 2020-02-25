import { ExpandComposite } from '../term.model';

export enum ExpandType {
  /** Arithmetic expansion. */
  arithmetic= 'arithmetic',
  /** Command substitution. */
  command= 'command',
  doubleQuote= 'doubleQuote',
  extendedGlob= 'extendedGlob',
  literal= 'literal',
  /** Parameter expansion. */
  parameter= 'parameter',
  parts= 'parts',
  /** Process substitution. */
  process= 'process',
  singleQuote= 'singleQuote',
}

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

export function isExpansionSpecial({ def }: ExpandComposite): boolean {
  if (def.expandKey === ExpandType.parameter) {
    if (def.parKey === ParamType['special'] && def.param === '@') {
      return true;// ${@}.
    } else if (def.parKey === 'plain' && def.index) {
      return def.index.value === '@';// ${x[@]}.
    }
  }
  return false;
}
