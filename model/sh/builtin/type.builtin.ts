import { BuiltinOtherType, isBuiltinSpecialCommand, isBuiltinOtherCommand } from '../builtin.model';
import { BaseBuiltinComposite } from './base-builtin';
import { ObservedType } from '@service/term.service';
import { OsDispatchOverload } from '@model/os/os.redux.model';
import { osGetFunctionThunk } from '@store/os/declare.os.duck';
import { NamedFunction } from '@model/os/process.model';
import { osResolvePathThunk } from '@store/os/file.os.duck';

/**
 * For each NAME, indicate how it would be interpreted if used as a command name.
 */
export class TypeBuiltin extends BaseBuiltinComposite<BuiltinOtherType.type> {

  public specOpts() {
    return { string: [], boolean: [] };
  }

  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    let namedFunc: null | NamedFunction;

    for (const command of this.def.args) {
      if (!command) {
        continue;
      } else if (isShellKeywordType(command)) {
        yield this.write(`${command} is a shell keyword`);
      // eslint-disable-next-line no-cond-assign
      } else if (namedFunc = dispatch(osGetFunctionThunk({ processKey, functionName: command }))) {
        yield this.write(`${command} is a function`);
        yield this.write([
          `${namedFunc.key} ()`,
          '{',
          ...(namedFunc.src ? namedFunc.src.split('\n').map((line) => `  ${line}`) : []),
          '}',
        ]);
      } else if (isBuiltinSpecialCommand(command) || isBuiltinOtherCommand(command)) {
        yield this.write(`${command} is a shell builtin`);
      } else {
        try {
          const { absPath } = dispatch(osResolvePathThunk({ processKey, path: command, PATH: true }));
          yield this.write(`${command} is ${absPath}`);
        } catch (e) {
          yield this.warn(`${command}: not found`);
          this.exitCode = 1;
        }
      }
    }
  }
}

/**
 * compgen -k
 */
export enum ShellKeywordType {
  if= 'if',
  then= 'then',
  else= 'else',
  elif= 'elif',
  fi= 'fi',
  case= 'case',
  esac= 'esac',
  for= 'for',
  select= 'select',
  while= 'while',
  until= 'until',
  do= 'do',
  done= 'done',
  in= 'in',
  function= 'function',
  time= 'time',
  '{'= '{',
  '}'= '}',
  '!'= '!',
  '[['= '[[',
  ']]'= ']]',
  coproc= 'coproc',
}

function isShellKeywordType(x: string): x is ShellKeywordType {
  return x in ShellKeywordType;
}
