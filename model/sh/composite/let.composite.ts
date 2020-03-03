import { BaseTermDef } from '../base-term';
import { CompositeType } from '../../os/term.model';
import { ArithmOpComposite } from './arithm-op.composite';
import { BaseCompositeTerm, CompositeChildren } from './base-composite';
import { ObservedType } from '@os-service/term.service';
import { OsDispatchOverload } from '@model/os/os.redux.model';

/**
 * let (a builtin)
 */
export class LetComposite extends BaseCompositeTerm<CompositeType.let> {
  public get children() {
    return this.def.cs.slice();
  }

  constructor(public def: LetCompositeDef) {
    super(def);
  }

  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    for (const child of this.def.cs) {
      yield* this.runChild({ child, dispatch, processKey });
    }
  }
}

interface LetCompositeDef extends BaseTermDef<CompositeType.let>, CompositeChildren<ArithmOpComposite> {}
