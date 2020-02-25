import { BaseTermDef } from '../base-term';
import { CompositeType, ExpandComposite } from '../../term.model';
import { BaseCompositeTerm } from './base-composite';
import { TestOpComposite } from './test-op.composite';
import { ObservedType } from '@service/term.service';
import { OsDispatchOverload } from '@model/os.redux.model';
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
    // Forward exit code.
    this.exitCode = this.def.expr.exitCode || 0;
  }
}

interface TestCompositeDef extends BaseTermDef<CompositeType.test>, TestDef<TestOpComposite | ExpandComposite> {}

interface TestDef<T> {
  expr: T;
}
