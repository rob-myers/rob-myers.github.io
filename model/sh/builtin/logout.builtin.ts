import { BuiltinOtherType } from '../builtin.model';
import { BaseBuiltinComposite } from './base-builtin';
import { ObservedType } from '@os-service/term.service';
import { OsDispatchOverload } from '@model/os/os.redux.model';
import { osIsLoginShell, osSignalForegroundThunk } from '@store/os/session.os.duck';
import { osGetProcessThunk } from '@store/os/process.os.duck';
import { ProcessSignal } from '@model/os/process.model';

export class LogoutBuiltin extends BaseBuiltinComposite<BuiltinOtherType.logout> {

  public specOpts() {
    return { string: [], boolean: [] };
  }

  /**
   * Exit interactive shell.
   */
  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    if (!dispatch(osIsLoginShell({ processKey }))) {
      return yield this.exit(1, 'not login shell: use `exit\'');
    }

    yield this.write('logout');
    const { sessionKey } = dispatch(osGetProcessThunk({ processKey }));
    dispatch(osSignalForegroundThunk({ sessionKey, signal: ProcessSignal.TERM }));
    yield this.exit();
  }
}
