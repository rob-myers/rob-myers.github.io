import { BaseTermDef } from '@model/sh/base-term';
import { CompositeType, Term } from '@model/term.model';
import { BaseCompositeTerm, CompositeChildren } from './base-composite';
import { ObservedType } from '@service/term.service';
import { OsDispatchOverload } from '@model/redux.model';
import { last } from '@model/generic.model';

/**
 * seq
 */
export class SeqComposite extends BaseCompositeTerm<CompositeType.seq> {

  public get children() {
    return this.def.cs;
  }

  constructor(public def: SeqCompositeDef) {
    super(def);
  }

  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    for (const child of this.def.cs) {
      yield* this.runChild({ child, dispatch, processKey});
    }
    // Inherit exit code from last child.
    yield this.exit(this.def.cs.length && (last(this.def.cs) as Term).exitCode || 0);
  }
}

interface SeqCompositeDef extends BaseTermDef<CompositeType.seq>, CompositeChildren<Term> {}
