import { ObservedType } from '@os-service/term.service';
import { OsDispatchOverload } from '@model/os/os.redux.model';
import { osSetPositionalsAct } from '@store/os/declare.os.duck';
import { BuiltinSpecialType } from '../builtin.model';
import { BaseBuiltinComposite } from './base-builtin';

export class SetBuiltin extends BaseBuiltinComposite<BuiltinSpecialType.set> {

  public specOpts() {
    return { string: [], boolean: [] };
  }

  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    dispatch(osSetPositionalsAct({ processKey, posPositionals: this.def.args }));
  }

}
