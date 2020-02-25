import { BaseBuiltinComposite } from './base-builtin';
import { BuiltinOtherType } from '../builtin.model';
import { ObservedType } from '@service/term.service';

export class FalseBuiltin extends BaseBuiltinComposite<BuiltinOtherType.false> {

  public specOpts() {
    return { string: [], boolean: [] };
  }

  public async *semantics(): AsyncIterableIterator<ObservedType> {
    yield this.exit(1);
  }

}
