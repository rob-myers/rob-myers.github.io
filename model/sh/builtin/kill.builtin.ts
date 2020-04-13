import { BaseBuiltinComposite } from './base-builtin';
import { BuiltinOtherType } from '../builtin.model';
import { ObservedType } from '@os-service/term.service';

export class KillBuiltin extends BaseBuiltinComposite<BuiltinOtherType.kill> {

  public specOpts() {
    return { string: [], boolean: [] };
  }

  public async *semantics(): AsyncIterableIterator<ObservedType> {
    /**
     * TODO
     */
  }

}
