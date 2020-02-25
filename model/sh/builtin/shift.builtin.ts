import { BaseBuiltinComposite } from './base-builtin';
import { BuiltinSpecialType } from '../builtin.model';
import { ObservedType } from '@service/term.service';
import { OsDispatchOverload } from '@model/os.redux.model';
import { osShiftPositionalsAct } from '@store/os/declare.os.duck';

export class ShiftBuiltin extends BaseBuiltinComposite<BuiltinSpecialType.shift> {
  
  public specOpts() {
    return { string: [], boolean: [] };
  }

  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    const [first] = this.def.args;

    if (this.def.args.length === 1) {
      const amount = parseInt(first);
      if (`${amount}` !== first) {
        yield this.exit(1, `${first}: numeric argument required`);
      } else if (amount < 0) {
        yield this.exit(1, `${first}: shift count out of range`);
      }
    } else if (this.def.args.length >= 2) {
      yield this.exit(1, 'too many arguments');
    }

    // Defaults to left shift by 1.
    const amount = first ? parseInt(first) : 1;
    dispatch(osShiftPositionalsAct({ processKey, amount }));
  }

}
