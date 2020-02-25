import { BaseBuiltinComposite } from './base-builtin';
import { BuiltinOtherType } from '../builtin.model';
import { ObservedType } from '@service/term.service';
import { OsDispatchOverload } from '@model/os/os.redux.model';
import { osExpandVarThunk } from '@store/os/declare.os.duck';

export class PwdBuiltin extends BaseBuiltinComposite<BuiltinOtherType.pwd> {

  public specOpts() {
    return { string: [], boolean: [] };
  }

  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    const pwd = dispatch(osExpandVarThunk({ processKey, varName: 'PWD' }));
    yield this.write(pwd);
  }

}
