import { BuiltinOtherType } from '../builtin.model';
import { BaseDeclareComposite } from './base-declare';
import { ObservedType } from '@os-service/term.service';

export class LocalBuiltin extends BaseDeclareComposite<BuiltinOtherType.local> {

  public specOpts() {
    return { string: [], boolean: [] };
  }

  public async *semantics(): AsyncIterableIterator<ObservedType> {
    //
  }

}
