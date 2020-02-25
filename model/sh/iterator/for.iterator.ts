import { BaseIteratorTerm, BaseIteratorTermDef } from './base-iterator';
import { IteratorType, ExpandComposite, Term } from '@model/term.model';
import { ObservedType } from '@service/term.service';

/**
 * for {paramName} in {items}; do {body}; done
 */
export class ForIterator extends BaseIteratorTerm<IteratorType.for> {

  public get children(): Term[] {
    const { items, body } = this.def;
    return [ ...items, body];
  }

  constructor(public def: ForIteratorDef) {
    super(def);
  }

  public async *semantics(): AsyncIterableIterator<ObservedType> {
    //
  }
}

interface ForIteratorDef extends BaseIteratorTermDef<IteratorType.for>, ForDef<ExpandComposite> {}

export interface ForDef<WordType> {
  items: WordType[];
  paramName: string;
}
