import { BaseTermDef } from '../base-term';
import { CompositeType, Term } from '../../os/term.model';
import { BaseCompositeTerm, CompositeChildren } from './base-composite';
import { ObservedType } from '@service/term.service';
import { last } from '@model/generic.model';
import { OsDispatchOverload } from '@model/os/os.redux.model';

/**
 * or
 */
export class OrComposite extends BaseCompositeTerm<CompositeType.or> {

  public get children() {
    return this.def.cs.slice();
  }

  constructor(public def: OrCompositeDef) {
    super(def);
  }

  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {

    for (const child of this.def.cs) {
      yield* this.runChild({ child, dispatch, processKey });

      if (child.exitCode === 0) {
        // Finished because child exited gracefully.
        return yield this.exit(0);
      }
    }
    
    yield this.exit(this.def.cs.length
      // Fail with final child's exit code.
      ? (last(this.def.cs) as Term).exitCode as number
      // Empty join is bottom i.e. false.
      : 1
    );
  }
}

interface OrCompositeDef extends BaseTermDef<CompositeType.or>, CompositeChildren<Term> {}
