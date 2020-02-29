import { BaseBuiltinComposite } from './base-builtin';
import { BuiltinOtherType } from '../builtin.model';
import { ObservedType } from '@os-service/term.service';

export class PrintfBuiltin extends BaseBuiltinComposite<
  BuiltinOtherType.printf,
  { string: 'v'[]; boolean: never[] }
> {

  public specOpts() {
    return { string: ['v'] as 'v'[], boolean: [] };
  }

  /**
   * TODO Implement option 'v' i.e. store as named variable instead of stdout.
   */
  public async *semantics(): AsyncIterableIterator<ObservedType> {
    // ...
  }

}
