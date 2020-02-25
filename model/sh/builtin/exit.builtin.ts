import { BuiltinSpecialType } from '../builtin.model';
import { BaseBuiltinComposite } from './base-builtin';
import { ObservedType } from '@service/term.service';
import { osTerminateProcessThunk, osIsSessionLeaderThunk } from '@store/os/process.os.duck';
import { OsDispatchOverload } from '@model/redux.model';

export class ExitBuiltin extends BaseBuiltinComposite<BuiltinSpecialType.exit> {

  public specOpts() {
    return { string: [], boolean: [] };
  }

  /**
   * Terminate process using specified exit code,
   * falling back to last exit code.
   */
  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    const message = dispatch(osIsSessionLeaderThunk({ processKey })) ? 'logout' : 'exit';
    yield this.write(message);

    const exitCode = this.def.args.length ? parseInt(this.def.args[0]) || 0 : 0;
    dispatch(osTerminateProcessThunk({ processKey, exitCode }));
  }
}
