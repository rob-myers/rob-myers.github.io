import globrex from 'globrex';
import { BaseCompositeTerm } from './base-composite';
import { CompositeType, Term, ExpandComposite } from '@model/os/term.model';
import { BaseTermDef } from '../base-term';
import { ObservedType } from '@os-service/term.service';
import { OsDispatchOverload } from '@model/os/os.redux.model';

/**
 * case
 */
export class CaseComposite extends BaseCompositeTerm<CompositeType.case> {

  constructor(public def: CaseCompositeDef) {
    super(def);
  }

  public get children(): Term[] {
    const { head, cases } = this.def;
    return ([] as Term[]).concat(
      head,
      cases.flatMap(({ globs, child }) => [...globs, child]),
    );
  }

  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    yield* this.runChild({ child: this.def.head, dispatch, processKey });

    const word = this.def.head.value;
    let matched = false;

    for (const { globs, child } of this.def.cases) {
      for (const glob of globs) {
        yield* this.runChild({ child: glob, dispatch, processKey });
        const { regex } = globrex(glob.value, { extended: true });
        // eslint-disable-next-line no-cond-assign
        if (matched = regex.test(word)) {
          break;
        }
      }
      if (matched) {
        yield* this.runChild({ child, dispatch, processKey });
        break;
      }
    }
    yield this.exit();
  }
}

interface CaseCompositeDef extends BaseTermDef<CompositeType.case>, CaseDef<Term, ExpandComposite> {}

export interface CaseDef<T, WordType> {
  head: WordType;
  cases: CasePart<T, WordType>[];
}
export interface CasePart<T, WordType> {
  /** met*|meet*) yields two. */
  globs: WordType[];
  child: T;
  terminal: ';;' | ';&' | ';;&';
}
