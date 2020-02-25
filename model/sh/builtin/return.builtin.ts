import { BaseBuiltinComposite } from './base-builtin';
import { BuiltinSpecialType } from '../builtin.model';
import { ObservedType } from '@service/term.service';

export class ReturnBuiltin extends BaseBuiltinComposite<BuiltinSpecialType.return> {

  public specOpts() {
    return { string: [], boolean: [] };
  }

  public async *semantics(): AsyncIterableIterator<ObservedType> {
    // ...
  }

}
