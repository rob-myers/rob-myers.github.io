import { BaseBuiltinComposite } from './base-builtin';
import { BuiltinOtherType } from '../builtin.model';
import { ObservedType } from '@os-service/term.service';
import { OsDispatchOverload } from '@model/os/os.redux.model';
import { osAssignVarThunk } from '@store/os/declare.os.duck';

export class ReadBuiltin extends BaseBuiltinComposite<BuiltinOtherType.read> {

  public specOpts() {
    return { string: [], boolean: [] };
  }

  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    const buffer = [] as string[];
    /**
     * Read exactly one line, or EOF.
     */
    while((yield this.read(1, 0, buffer)) && !buffer.length);
    /**
     * Exit code 1 iff EOF.
     */
    this.exitCode = buffer.length ? 0 : 1;
    /**
     * Extract words from line, handling undefined case (EOF).
     */
    const [line] = buffer;
    const words = (line || '').trim().replace(/\s\s+/g, ' ').split(' ');
    /**
     * Assign words to variables.
     */
    const lastArg = this.def.args.pop();

    for (const varName of this.def.args) {
      const varValue = words.shift() || '';
      dispatch(osAssignVarThunk({ processKey, varName, act: { key: 'default', value: varValue } }));
    }
    if (lastArg) {
      dispatch(osAssignVarThunk({ processKey, varName: lastArg, act: { key: 'default', value: words.join(' ') } }));
    }
  }

}
