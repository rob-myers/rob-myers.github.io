import { BaseCompositeTerm, CompositeChildren } from './base-composite';
import { CompositeType, Term } from '@model/term.model';
import { BaseTermDef } from '../base-term';
import { ObservedType } from '@service/term.service';
import { last } from '@model/generic.model';
import { OsDispatchOverload } from '@model/os.redux.model';

/**
 * block
 */
export class BlockComposite extends BaseCompositeTerm<CompositeType.block> {
  public get children() {
    return this.def.cs.slice();
  }

  constructor(public def: BlockCompositeDef) {
    super(def);
  }


  /**
   * Same as {SeqComposite}
   * However, can be redirected as child of {CompositeCommand}.
   */
  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    for (const child of this.def.cs) {
      yield* this.runChild({ child, dispatch, processKey});
    }
    // Inherit exit code from last child.
    yield this.exit(this.def.cs.length && (last(this.def.cs) as Term).exitCode || 0);
  }
}

interface BlockCompositeDef extends BaseTermDef<CompositeType.block>, CompositeChildren<Term> {}
