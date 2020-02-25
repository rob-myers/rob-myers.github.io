import { BaseTermDef } from '../base-term';
import { CompositeType } from '../../os/term.model';
import { ArithmOpComposite } from './arithm-op.composite';
import { BaseCompositeTerm, CompositeChildren } from './base-composite';
import { ObservedType } from '@service/term.service';

/**
 * let
 */
export class LetComposite extends BaseCompositeTerm<CompositeType.let> {
  public get children() {
    return this.def.cs.slice();
  }

  constructor(public def: LetCompositeDef) {
    super(def);
  }

  public async *semantics(): AsyncIterableIterator<ObservedType> {
    //
  }
}

interface LetCompositeDef extends BaseTermDef<CompositeType.let>, CompositeChildren<ArithmOpComposite> {
}
