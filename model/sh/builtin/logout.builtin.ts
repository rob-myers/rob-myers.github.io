import { BuiltinOtherType } from '../builtin.model';
import { BaseBuiltinComposite } from './base-builtin';
import { ObservedType } from '@os-service/term.service';
import { OsDispatchOverload } from '@model/os/os.redux.model';
import { osIsLoginShell, osEndSessionThunk } from '@store/os/session.os.duck';
import { osGetProcessThunk } from '@store/os/process.os.duck';

export class LogoutBuiltin extends BaseBuiltinComposite<BuiltinOtherType.logout> {

  public specOpts() {
    return { string: [], boolean: [] };
  }

  /**
   * Exit interactive shell.
   */
  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    if (!dispatch(osIsLoginShell({ processKey }))) {
      yield this.exit(1, 'not login shell: use `exit\'');
      return;
    }

    yield this.write('logout');
    const { sessionKey } = dispatch(osGetProcessThunk({ processKey }));
    dispatch(osEndSessionThunk({ sessionKey }));
    yield this.exit(0);
  }
}
