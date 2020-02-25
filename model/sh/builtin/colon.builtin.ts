import { BaseBuiltinComposite } from './base-builtin';
import { BuiltinSpecialType } from '../builtin.model';
import { ObservedType } from '@service/term.service';

export class ColonBuiltin extends BaseBuiltinComposite<BuiltinSpecialType.colon> {

  public specOpts() {
    return { string: [], boolean: [] };
  }

  public async *semantics(): AsyncIterableIterator<ObservedType> {
    /**
     * Intentionally empty.
     */
  }

}
