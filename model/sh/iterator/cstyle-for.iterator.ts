/* eslint-disable @typescript-eslint/camelcase */
import { BaseIteratorTerm, BaseIteratorTermDef } from './base-iterator';
import { IteratorType, Term } from '@model/term.model';
import { ArithmOpComposite } from '../composite/arithm-op.composite';
import { ObservedType } from '@service/term.service';

/**
 * Alternative 'for'
 * > for (( expr1; expr2; expr3 )); do {body}; done
 */
export class CstyleForIterator extends BaseIteratorTerm<IteratorType.cstyle_for> {

  constructor(public def: CstyleForIteratorDef) {
    super(def);
  }

  public get children(): Term[] {
    const { prior, condition, post, body } = this.def;
    return [prior, condition, post, body];
  }

  public async *semantics(): AsyncIterableIterator<ObservedType> {
    //
  }
}

interface CstyleForIteratorDef extends BaseIteratorTermDef<IteratorType.cstyle_for>, CstyleForDef<ArithmOpComposite> {}

interface CstyleForDef<OpType> {
  prior: OpType;
  condition: OpType;
  post: OpType;
}
