import { BaseExpandComposite, BaseExpandCompositeDef } from './base-expand';
import { ExpandComposite } from '@model/os/term.model';
import { ExpandType } from '../expand.model';
import { ArithmOpComposite } from '../composite/arithm-op.composite';
import { ObservedType } from '@os-service/term.service';
import { OsDispatchOverload } from '@model/os/os.redux.model';
import { isStringInt } from '@model/generic.model';

export class ArithmExpand extends BaseExpandComposite<ExpandType.arithmetic> {

  public get children() {
    return [this.def.expr];
  }

  constructor(public def: ArithmExpandCompositeDef) {
    super(def);
  }

  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    yield* this.runArithmExpr({ child: this.def.expr, dispatch, processKey });
    /**
     * Exit code 0 iff {this.value} is {String(n)} for some non-zero integer n.
     */
    if (isStringInt(this.value)) {
      yield this.exit(parseInt(this.value) ? 0 : 1);
    }
    yield this.exit(1); 
  }
}

interface ArithmExpandCompositeDef extends BaseExpandCompositeDef<ExpandType.arithmetic>, ArithmExpandDef<ArithmOpComposite | ExpandComposite> {}

export interface ArithmExpandDef<OpType> {
  expr: OpType;
}
