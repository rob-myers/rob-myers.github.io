import { BaseIteratorTerm, BaseIteratorTermDef } from './base-iterator';
import { IteratorType, Term } from '@model/term.model';
import { ObservedType } from '@service/term.service';
import { OsDispatchOverload } from '@model/os.redux.model';

/**
 * while
 */
export class WhileIterator extends BaseIteratorTerm<IteratorType.while> {

  public get children(): Term[] {
    return [this.def.guard, this.def.body];
  }

  constructor(public def: WhileIteratorDef) {
    super(def);
  }

  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    const { guard, body } = this.def;

    while (true) {
      yield* this.runChild({ child: guard, dispatch, processKey });

      if (guard.exitCode) {
        break; // Guard failed, so stop.
      } else if (this.breakDepth || this.returnCode !== null || (this.continueDepth && this.continueDepth > 1)) {
        this.propagateBreakers();
        break; // break, return, or continue outer-loop.
      } else if (this.continueDepth === 1) {
        this.continueDepth = 0; // continue.
        continue;
      }

      // Guard succeeded, so run body.
      yield* this.runChild({ child: body, dispatch, processKey });

      if (this.breakDepth || this.returnCode !== null || (this.continueDepth && this.continueDepth > 1)) {
        this.propagateBreakers();
        break;
      } else if (this.continueDepth === 1) {
        this.continueDepth = 0; // No need to continue.
      }
    }
  }
}

interface WhileIteratorDef extends BaseIteratorTermDef<IteratorType.while>, WhileDef<Term> {}

interface WhileDef<T> {
  guard: T;
}
