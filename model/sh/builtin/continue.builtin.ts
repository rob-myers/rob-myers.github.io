import { BaseBuiltinComposite } from './base-builtin';
import { BuiltinSpecialType } from '../builtin.model';
import { ObservedType } from '@service/term.service';
import { findAncestralTerm } from '@service/term.util';
import { Term, IteratorTerm } from '@model/term.model';

export class ContinueBuiltin extends BaseBuiltinComposite<BuiltinSpecialType.continue> {

  public specOpts() {
    return { string: [], boolean: [] };
  }

  public async *semantics(): AsyncIterableIterator<ObservedType> {
    const ancestralIterator = findAncestralTerm(this, (term): term is IteratorTerm => term.type === 'iterator');

    if (!ancestralIterator) {
      yield this.exit(1, 'only meaningful in a `for\', `while\', or `until\' loop');
    } else if (this.def.args.length > 1) {
      yield this.exit(1, 'too many arguments');
    }

    const depth = this.def.args.length ? parseInt(this.def.args[0]) : 1;

    if (Number.isNaN(depth)) {
      yield this.exit(1, `${this.def.args[0]}: numeric argument required`);
    } else if (depth <= 0) {
      yield this.exit(1, `${this.def.args[0]}: loop count out of range`);
    }
  
    /**
     * Propagate continue, detected in {BaseComposite.*runChild} and {BaseIterator} instances.
     */
    (this.parent as Term).continueDepth = depth;
  }

}
