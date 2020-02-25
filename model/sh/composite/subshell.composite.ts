import { BaseTermDef } from '../base-term';
import { CompositeType, Term } from '../../os/term.model';
import { BaseCompositeTerm, CompositeChildren } from './base-composite';
import { ObservedType } from '@service/term.service';
/**
 * subshell
 */
export class SubshellComposite extends BaseCompositeTerm<CompositeType.subshell> {
  public get children() {
    return this.def.cs.slice();
  }

  constructor(public def: SubshellCompositeDef) {
    super(def);
  }

  public async *semantics(): AsyncIterableIterator<ObservedType> {
    //
  }
}
interface SubshellCompositeDef extends BaseTermDef<CompositeType.subshell>, CompositeChildren<Term> {
}

