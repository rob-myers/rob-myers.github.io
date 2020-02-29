import { BaseBuiltinComposite, BaseBuiltinCompositeDef } from './base-builtin';
import { BuiltinSpecialType } from '../builtin.model';
import { RedirectComposite } from '../composite/redirect.composite';
import { ObservedType } from '@os-service/term.service';

/**
 * Exec is special.
 * We do not mount a term, since we replace the root of the term-tree.
 * 
 * TODO When not only redirects, serialize them and append to args.
 * TODO Check if command is executable pre-exec.
 */
export class ExecBuiltin extends BaseBuiltinComposite<BuiltinSpecialType.exec> {
  /** Attached by `SimpleComposite`. */
  public redirects: RedirectComposite[];

  constructor(public def: BaseBuiltinCompositeDef<BuiltinSpecialType.exec>) {
    super(def);
    this.redirects = [];
  }

  public specOpts() {
    return { string: [], boolean: [] };
  }

  public async *semantics(): AsyncIterableIterator<ObservedType> {
    // ...
  }

}
