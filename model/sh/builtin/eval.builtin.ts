import { BaseBuiltinComposite, BaseBuiltinCompositeDef } from './base-builtin';
import { BuiltinSpecialType } from '../builtin.model';
import { Term } from '@model/os/term.model';
import { ObservedType } from '@service/term.service';

/**
 * Parse args, mounting respective term.
 */
export class EvalBuiltin extends BaseBuiltinComposite<BuiltinSpecialType.eval> {

  public get children() {
    return this.mounted ? [this.mounted] : [];
  }

  public mounted: null | Term;

  constructor(public def: BaseBuiltinCompositeDef<BuiltinSpecialType.eval>) {
    super(def);
    this.mounted = null;
  }

  public onEnter() {
    super.onEnter();
    this.mounted = null;
  }

  public specOpts() {
    return { string: [], boolean: [] };
  }

  public async *semantics(): AsyncIterableIterator<ObservedType> {
    // ...
  }

}
