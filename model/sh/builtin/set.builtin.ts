import { BuiltinSpecialType } from '../builtin.model';
import { BaseBuiltinComposite } from './base-builtin';
import { ObservedType } from '@os-service/term.service';

export class SetBuiltin extends BaseBuiltinComposite<BuiltinSpecialType.set> {

  public specOpts() {
    return { string: [], boolean: [] };
  }

  public async *semantics(): AsyncIterableIterator<ObservedType> {
    /**
     * TODO (?)
     */
  }

}
