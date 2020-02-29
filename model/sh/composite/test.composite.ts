import { BaseTermDef } from '../base-term';
import { CompositeType, ExpandComposite } from '../../os/term.model';
import { BaseCompositeTerm } from './base-composite';
import { TestOpComposite } from './test-op.composite';
import { ObservedType } from '@os-service/term.service';
import { OsDispatchOverload } from '@model/os/os.redux.model';
/**
 * test
 */
export class TestComposite extends BaseCompositeTerm<CompositeType.test> {

  public get children() {
    return [this.def.expr];
  }

  constructor(public def: TestCompositeDef) {
    super(def);
  }

  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    yield* this.runChild({ child: this.def.expr, dispatch, processKey });
    this.exitCode = this.def.expr.exitCode || 0; // Forward exit code.
  }
}

interface TestCompositeDef extends BaseTermDef<CompositeType.test>, TestDef<TestOpComposite | ExpandComposite> {}

interface TestDef<T> {
  expr: T;
}
