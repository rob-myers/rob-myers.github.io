import { BuiltinSpecialType } from '../builtin.model';
import { BaseBuiltinComposite } from './base-builtin';
import { ObservedType } from '@os-service/term.service';
import { osIsSessionLeaderThunk, osGetProcessThunk } from '@store/os/process.os.duck';
import { OsDispatchOverload } from '@model/os/os.redux.model';
import { osSignalForegroundThunk } from '@store/os/session.os.duck';
import { ProcessSignal } from '@model/os/process.model';

export class ExitBuiltin extends BaseBuiltinComposite<BuiltinSpecialType.exit> {

  public specOpts() {
    return { string: [], boolean: [] };
  }

  /**
   * Terminate process using specified exit code or last exit code.
   */
  public async *semantics(
    dispatch: OsDispatchOverload,
    processKey: string,
  ): AsyncIterableIterator<ObservedType> {
    yield this.write(dispatch(osIsSessionLeaderThunk({ processKey })) ? 'logout' : 'exit');
    
    const { lastExitCode, sessionKey } = dispatch(osGetProcessThunk({ processKey }));
    const exitCode = parseInt(this.def.args[0]) || lastExitCode || 0;
    dispatch(osSignalForegroundThunk({ sessionKey, signal: ProcessSignal.TERM }));
    
    yield this.exit(exitCode);
  }
}
