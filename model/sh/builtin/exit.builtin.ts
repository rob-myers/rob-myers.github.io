import { BuiltinSpecialType } from '../builtin.model';
import { BaseBuiltinComposite } from './base-builtin';
import { ObservedType } from '@os-service/term.service';
import { osTerminateProcessThunk, osIsSessionLeaderThunk, osGetProcessThunk } from '@store/os/process.os.duck';
import { OsDispatchOverload } from '@model/os/os.redux.model';
import { osEndSessionThunk } from '@store/os/session.os.duck';

export class ExitBuiltin extends BaseBuiltinComposite<BuiltinSpecialType.exit> {

  public specOpts() {
    return { string: [], boolean: [] };
  }

  /**
   * Terminate process using specified exit code,
   * falling back to last exit code.
   */
  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    const logout = dispatch(osIsSessionLeaderThunk({ processKey }));
    yield this.write(logout ? 'logout' : 'exit');
    
    const exitCode = this.def.args.length ? parseInt(this.def.args[0]) || 0 : 0;

    if (logout) {
      const { sessionKey } = dispatch(osGetProcessThunk({ processKey }));
      dispatch(osEndSessionThunk({ sessionKey }));
    } else {
      dispatch(osTerminateProcessThunk({ processKey, exitCode }));
    }
    
    yield this.exit(exitCode);
  }
}
