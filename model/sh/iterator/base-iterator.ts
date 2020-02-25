import { IteratorType, Term, IteratorTerm } from '@model/term.model';
import { BaseTerm, BaseTermDef } from '@model/sh/base-term';
import { OsDispatchOverload } from '@model/os.redux.model';
import { ObservedType } from '@service/term.service';
import { iterateTerm } from '@service/term.util';

export abstract class BaseIteratorTerm<ExactKey extends IteratorType> extends BaseTerm<ExactKey> {
  public readonly type = 'iterator';

  constructor(public def: BaseIteratorTermDef<ExactKey>) {
    super(def);
  }

  public adoptChildren() {
    super.adoptChildren();
    this.def.body.parent = this as unknown as IteratorTerm;
  }

  /**
   * Propagate {break,continue} depth, and returnCode.
   */
  protected propagateBreakers(): void {
    if (this.breakDepth) {// Detected break.
      this.parent && (this.parent.breakDepth = this.breakDepth - 1);
    } else if (this.continueDepth) {// Detected continue.
      this.parent && (this.parent.continueDepth = this.continueDepth - 1);
    } else if (this.returnCode !== null) {// Detected function return.
      this.parent && (this.parent.returnCode = this.returnCode);
    }
  }

  protected async *runChild({ child, dispatch, processKey }: {
    child: Term;
    dispatch: OsDispatchOverload;
    processKey: string;
  }): AsyncIterableIterator<ObservedType> {
    yield* iterateTerm({term: child, dispatch, processKey});
  }

}

export interface BaseIteratorTermDef<ExactKey extends IteratorType> extends BaseTermDef<ExactKey> {
  key: ExactKey;
  body: Term;
}
