/* eslint-disable @typescript-eslint/camelcase */
import { BaseIteratorTerm, BaseIteratorTermDef } from './base-iterator';
import { IteratorType, Term } from '@model/os/term.model';
import { ArithmOpComposite } from '../composite/arithm-op.composite';
import { ObservedType } from '@service/term.service';
import { OsDispatchOverload } from '@model/os/os.redux.model';

/**
 * Alternative 'for'
 * > for (( expr1; expr2; expr3 )); do {body}; done
 */
export class CstyleForIterator extends BaseIteratorTerm<IteratorType.cstyle_for> {

  constructor(public def: CstyleForIteratorDef) {
    super(def);
  }

  public get children(): Term[] {
    const { prior, condition, post, body } = this.def;
    return [prior, condition, post, body];
  }

  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    const { prior, condition, post, body } = this.def;
    const base = { dispatch, processKey };

    yield* this.runChild({ child: prior, ...base });

    while (true) {
      yield* this.runChild({ child: condition, ...base });
      if (condition.value === 0) {
        break;
      }
      yield* this.runChild({ child: body, ...base});
      yield* this.runChild({ child: post, ...base});

      if (this.breakDepth || this.returnCode !== null || this.continueDepth && this.continueDepth > 1) {
        this.propagateBreakers();
        break;
      } else if (this.continueDepth === 1) {
        this.continueDepth = 0;// No need to continue.
      }
    }

    yield this.exit();
  }
}

interface CstyleForIteratorDef extends BaseIteratorTermDef<IteratorType.cstyle_for>, CstyleForDef<ArithmOpComposite> {}

interface CstyleForDef<OpType> {
  prior: OpType;
  condition: OpType;
  post: OpType;
}
