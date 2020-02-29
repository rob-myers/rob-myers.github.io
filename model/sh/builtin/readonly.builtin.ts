import { BuiltinSpecialType } from '../builtin.model';
import { BaseDeclareComposite } from './base-declare';
import { ObservedType } from '@os-service/term.service';

export class ReadonlyBuiltin extends BaseDeclareComposite<BuiltinSpecialType.readonly> {

  public specOpts() {
    return { string: [], boolean: [] };
  }

  public async *semantics(): AsyncIterableIterator<ObservedType> {
    //
  }

}
