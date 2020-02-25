import { OsDispatchOverload } from '@model/os.redux.model';
import { ExpandComposite, Term, CompositeType } from '@model/term.model';
import { ArithmOpComposite } from './arithm-op.composite';
import { BaseCompositeTerm } from './base-composite';
import { BaseTermDef } from '@model/sh/base-term';
import { ObservedType } from '@service/term.service';

/**
 * array
 */
export class ArrayComposite extends BaseCompositeTerm<CompositeType.array> {

  public get children() {
    return this.def.pairs.reduce<Term[]>(
      (agg, { key, value }) => agg.concat(key || [], value),
      [],
    );
  }

  constructor(public def: ArrayCompositeDef) {
    super(def);
  }

  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    for (const { key, value } of this.def.pairs) {
      if (key) {
        yield* this.runChild({ child: key, dispatch, processKey });
      }
      yield* this.runChild({ child: value, dispatch, processKey });
    }
  }
}

interface ArrayCompositeDef extends BaseTermDef<CompositeType.array>,
  ArrayDef<ExpandComposite, ArithmOpComposite | ExpandComposite> {}

interface ArrayDef<WordType, OpType> {
  pairs: { key: null | OpType; value: WordType }[];
}
