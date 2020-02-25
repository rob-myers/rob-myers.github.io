import { BaseTermDef } from '../base-term';
import { CompositeType, Term } from '../../term.model';
import { BaseCompositeTerm } from './base-composite';
import { ObservedType } from '@service/term.service';
/**
 * time
 */
export class TimeComposite extends BaseCompositeTerm<CompositeType.time> {
  public get children() {
    return this.def.timed ? [this.def.timed] : [];
  }

  constructor(public def: TimeCompositeDef) {
    super(def);
  }

  public async *semantics(): AsyncIterableIterator<ObservedType> {
    //
  }
}
interface TimeCompositeDef extends BaseTermDef<CompositeType.time>, TimeDef<Term> {
}
interface TimeDef<T> {
  timed: T | null;
  posix: boolean;
}
