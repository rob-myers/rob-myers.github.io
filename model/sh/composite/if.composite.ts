import { BaseCompositeTerm, CompositeChildren } from './base-composite';
import { CompositeType, Term } from '@model/term.model';

import { BaseTermDef } from '../base-term';
import { ObservedType } from '@service/term.service';
import { OsDispatchOverload } from '@model/os.redux.model';

/**
 * if
 */
export class IfComposite extends BaseCompositeTerm<CompositeType.if> {

  public get children(): Term[] {
    return this.def.cs.reduce<Term[]>(
      (agg, { child, test }) => agg.concat(child, test || []),
      [],
    );
  }

  constructor(public def: IfCompositeDef) {
    super(def);
  }

  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    for (const { test, child } of this.def.cs) {
      if (test) {// if | elif i.e. have a test.
        yield* this.runChild({ child: test, dispatch, processKey });

        if (test.exitCode === 0) {// Test succeeded.
          yield* this.runChild({ child, dispatch, processKey });
          yield this.exit(child.exitCode || 0);
          return;
        }
      } else {// else.
        yield* this.runChild({ child, dispatch, processKey });
        yield this.exit(child.exitCode || 0);
        return;
      }
    }
  }
}
interface IfCompositeDef extends BaseTermDef<CompositeType.if>, CompositeChildren<IfPart<Term>> {}

export interface IfPart<T> {
  child: T;
  /** null iff 'else'. */
  test: null | T;
}
