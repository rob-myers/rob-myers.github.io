import { BaseTermDef } from '../base-term';
import { BaseCompositeTerm, CompositeChildren } from './base-composite';
import { CompositeType, Term } from '@model/os/term.model';
import { ObservedType } from '@os-service/term.service';
import { OsDispatchOverload } from '@model/os/os.redux.model';

/**
 * and
 */
export class AndComposite extends BaseCompositeTerm<CompositeType.and> {
  constructor(public def: AndCompositeDef) {
    super(def);
  }

  public get children() {
    return this.def.cs.slice();
  }

  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    for (const child of this.def.cs) {
      yield* this.runChild({ child, dispatch, processKey });

      if (child.exitCode) {// Fail using child's exitCode.
        yield this.exit(child.exitCode);
        return;
      }
    }
  }
}

interface AndCompositeDef extends BaseTermDef<CompositeType.and>, CompositeChildren<Term> {}
