import { BaseBuiltinComposite } from '../builtin/base-builtin';
import { BuiltinOtherType } from '../builtin.model';
import { ObservedType } from '@os-service/term.service';

export class TrueBuiltin extends BaseBuiltinComposite<BuiltinOtherType.true> {

  public specOpts() {
    return { string: [], boolean: [] };
  }

  public async *semantics(): AsyncIterableIterator<ObservedType> {
    /**
     * NOOP
     */
  }

}
