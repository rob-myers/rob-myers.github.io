import { BaseCompositeTerm } from './base-composite';
import { CompositeType, Term } from '@model/os/term.model';
import { BaseTermDef } from '../base-term';
import { ObservedType } from '@os-service/term.service';
import { OsDispatchOverload } from '@model/os/os.redux.model';

/**
 * coproc
 */
export class CoprocComposite extends BaseCompositeTerm<CompositeType.coproc> {

  constructor(public def: CoprocDef) {
    super(def);
  }

  public get children(): Term[] {
    return [this.def.child];
  }

  public async *semantics(_dispatch: OsDispatchOverload, _processKey: string): AsyncIterableIterator<ObservedType> {
    /**
     * TODO
     */
  }
}

interface CoprocDef extends BaseTermDef<CompositeType.coproc> {
  child: Term;
  name?: string;
}