import { BaseCompositeTerm } from './base-composite';
import { CompositeType, Term, ExpandComposite } from '@model/os/term.model';
import { flatten } from '@model/generic.model';
import { BaseTermDef } from '../base-term';
import { ObservedType } from '@service/term.service';

/**
 * case
 */
export class CaseComposite extends BaseCompositeTerm<CompositeType.case> {
  constructor(public def: CaseCompositeDef) {
    super(def);
  }

  public get children(): Term[] {
    const { head, cases } = this.def;
    return ([] as Term[]).concat(
      head,
      flatten(cases.map(({ globs, child }) => [...globs, child])),
    );
  }

  public async *semantics(): AsyncIterableIterator<ObservedType> {
    //
  }
}
interface CaseCompositeDef extends BaseTermDef<CompositeType.case>, CaseDef<Term, ExpandComposite> {}

export interface CaseDef<T, WordType> {
  head: WordType;
  cases: CasePart<T, WordType>[];
}
export interface CasePart<T, WordType> {
  /** met*|meet*) yields two. */
  globs: WordType[];
  child: T;
  terminal: ';;' | ';&' | ';;&';
}
