import { keys } from '@model/generic.model';
import { DeclareBuiltinType } from '../term.model';
import { EchoBuiltin } from './builtin/echo.builtin';
import { PwdBuiltin } from './builtin/pwd.builtin';
import { TestBuiltin } from './builtin/test.builtin';
// import { BaseBuiltinComposite } from "./builtin/base-builtin";

// export type BuiltinCompositeJSON = BaseBuiltinComposite<BuiltinType>

export enum BuiltinSpecialType {
  break= 'break',
  /**
   * Actual command name is ':'.
   */
  colon= 'colon',
  continue= 'continue',
  eval= 'eval',
  exec= 'exec',
  exit= 'exit',
  export= 'export',
  /**
   * Actual command name is '.'.
   */
  period= 'period',
  readonly= 'readonly',
  return= 'return',
  set= 'set', // TODO
  shift= 'shift',
  trap= 'trap', // TODO
  unset= 'unset',
}

export function isBuiltinSpecialType (
  key: string,
  /**
   * 'colon' corresponds to command ':'
   * 'period' corresponds to command '.'
   */
  requireIsCommand = false,
): key is BuiltinSpecialType {
  if (requireIsCommand) {
    if (key === BuiltinSpecialType.colon || key === BuiltinSpecialType.period) {
      return false;
    }
  }
  return key in BuiltinSpecialType;
}

export type BuiltinSpecialBinary = Exclude<
  BuiltinSpecialType,
  BuiltinSpecialType.colon | BuiltinSpecialType.period
>;

/**
 * Those special builtins keys whose value is a command.
 * That is, all of them except colon (:) and period (.).
 */
export const builtinSpecialCommands = keys(BuiltinSpecialType)
  .filter((x) =>
    x !== BuiltinSpecialType.colon
    && x !== BuiltinSpecialType.period
  ) as BuiltinSpecialBinary[];

/**
 * Is {x} the command of a special builtin?
 */
export function isBuiltinSpecialCommand(
  x: string,
): x is '.' | ':' | BuiltinSpecialBinary {
  return (x === '.')
    || (x === ':')
    || builtinSpecialCommands.includes(x as any);
}

export enum BuiltinOtherType {
  alias= 'alias',// TODO
  bind= 'bind',// TODO
  builtin= 'builtin',// TODO
  caller= 'caller',// TODO
  cd= 'cd',
  command= 'command',// TODO
  declare= 'declare',
  echo= 'echo',
  enable= 'enable',// TODO
  false= 'false',
  help= 'help',// TODO
  /**
   * See LetComposite.
   */
  let= 'let',
  local= 'local',
  logout= 'logout',// TODO
  mapfile= 'mapfile',// TODO
  printf= 'printf',
  pwd= 'pwd',
  read= 'read',
  readarray= 'readarray',// TODO
  /**
   * Same as '.'.
   */
  source= 'source',// TODO
  /**
   * Similar to {test}.
   * Actual command is [.
   */
  squareBracket= 'squareBracket',
  test= 'test',
  times= 'times',// TODO
  true= 'true',
  type= 'type',// TODO
  /**
   * Same as {declare}.
   */
  typeset= 'typeset',
  ulimit= 'ulimit',// TODO
  umask= 'umask',// TODO
  unalias= 'unalias',// TODO
}

export function isBuiltinOtherType(
  key: string,
  /** {squareBracket} corresponds to command '['. */
  requireIsCommand = false,
): key is BuiltinOtherType {
  if (requireIsCommand && key === BuiltinOtherType.squareBracket) {
    return false;
  }
  return key in BuiltinOtherType;
}

export type BuiltinOtherBinary = (
  | '['
  | Exclude<BuiltinOtherType, BuiltinOtherType.squareBracket>
);

/**
 * Other builtins, where {squareBracket} becomes '['.
 */
export const builtinOtherBinaries = [
  BuiltinOtherType.alias,
  BuiltinOtherType.bind,
  BuiltinOtherType.builtin,
  BuiltinOtherType.caller,
  BuiltinOtherType.cd,
  BuiltinOtherType.command,
  BuiltinOtherType.declare,
  BuiltinOtherType.echo,
  BuiltinOtherType.enable,
  BuiltinOtherType.false,
  BuiltinOtherType.help,
  BuiltinOtherType.let,
  BuiltinOtherType.local,
  BuiltinOtherType.logout,
  BuiltinOtherType.mapfile,
  BuiltinOtherType.printf,
  BuiltinOtherType.pwd,
  BuiltinOtherType.read,
  BuiltinOtherType.readarray,
  BuiltinOtherType.source,
  '[',
  BuiltinOtherType.test,
  BuiltinOtherType.times,
  BuiltinOtherType.true,
  BuiltinOtherType.type,
  BuiltinOtherType.typeset,
  BuiltinOtherType.ulimit,
  BuiltinOtherType.umask,
  BuiltinOtherType.unalias,
] as BuiltinOtherBinary[];

/**
 * Is {x} the command of a non-special builtin?
 */
export function isBuiltinOtherCommand(
  x: string,
): x is BuiltinOtherBinary {
  return builtinOtherBinaries.includes(x as any);
}

export type BuiltinType = (
  | BuiltinSpecialType
  | BuiltinOtherType
);

/**
 * Convert alphabetic key to respective command,
 * e.g. {squareBracket} -> '['.
 */
export function builtinKeyToCommand(key: BuiltinType): BuiltinCommandType {
  switch (key) {
    case BuiltinSpecialType.colon: return ':';
    case BuiltinSpecialType.period: return '.';
    case BuiltinOtherType.squareBracket: return '[';
    default: return key;
  }
}

/**
 * colon (:) and period (.) do not have a corresponding binary,
 * although {squareBracket} ([) does.
 */
export function builtinKeyHasBinary(key: BuiltinType): boolean {
  return (
    key !== BuiltinSpecialType.colon
    && key !== BuiltinSpecialType.period
  );
}

/**
 * Commands which invoke builtins.
 */
export type BuiltinCommandType = (
  | ':' |  '.' | '['
  | Exclude<BuiltinSpecialType, BuiltinSpecialType.colon | BuiltinSpecialType.period>
  | Exclude<BuiltinOtherType, BuiltinOtherType.squareBracket>
)

/**
 * Some builtins have binaries.
 */
export type BuiltinBinaryType = (
  | BuiltinOtherType.echo
  | BuiltinOtherType.pwd
  | '['
);

export const builtinBinaryTypes: [BuiltinOtherType.echo, BuiltinOtherType.pwd, '['] = [
  BuiltinOtherType.echo,
  BuiltinOtherType.pwd,
  '[',
];

export type BuiltinBinary = (
  | EchoBuiltin
  | PwdBuiltin
  | TestBuiltin
);

export function isDeclareBuiltinType(x: BuiltinType): x is DeclareBuiltinType {
  return [
    BuiltinOtherType.declare,
    BuiltinSpecialType.export,
    BuiltinOtherType.local,
    BuiltinSpecialType.readonly,
    BuiltinOtherType.typeset,
  ].includes(x);
}
