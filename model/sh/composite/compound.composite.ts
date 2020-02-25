import { BaseCompositeTerm } from './base-composite';
import { RedirectComposite } from './redirect.composite';
import { CompositeType, Term } from '@model/term.model';
import { BaseTermDef } from '../base-term';
import { ObservedType } from '@service/term.service';
import { OsDispatchOverload } from '@model/os.redux.model';
import { osPushRedirectScopeAct, osPopRedirectScopeAct } from '@store/os/declare.os.duck';
import { osSpawnChildThunk } from '@store/os/process.os.duck';
import { osCloneTerm } from '@store/os/parse.os.duck';
import { launchedInteractively } from '@service/term.util';

/**
 * compound
 */
export class CompoundComposite extends BaseCompositeTerm<CompositeType.compound> {
  public get children() {
    return ([] as Term[]).concat(
      this.def.child,
      this.def.redirects,
    );
  }

  constructor(public def: CompoundCompositeDef) {
    super(def);
  }

  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {

    if (this.def.background) {
      yield* this.runInBackground(dispatch, processKey);
    } else {
      yield* this.runChild(
        { child: this.def.child, dispatch, processKey },
        { freshRedirs: this.def.redirects },
      );
    }
    yield this.exit(this.exitCode || 0); // Propagate.
  }

  public async *runInBackground(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    if (this.def.redirects.length) {
      /**
       * Apply redirect in current process in new scope.
       */
      dispatch(osPushRedirectScopeAct({ processKey }));
      for (const redirect of this.def.redirects) {
        yield* this.runChild({ child: redirect, dispatch, processKey });
      }
    }
    /**
     * Spawn child in background.
     */
    const childProcessKey = `${this.def.child.key}-${this.def.child.termId}.composite.${processKey}`;
    dispatch(osSpawnChildThunk({
      processKey,
      childProcessKey,
      background: true,
      term: dispatch(osCloneTerm({ term: this.def.child })),
      redirects: [],
      specPgKey: launchedInteractively(this) ? childProcessKey : undefined,
      posPositionals: [],
    }));

    if (this.def.redirects.length) {// Release scope.
      dispatch(osPopRedirectScopeAct({ processKey }));
    }
  }
}

interface CompoundCompositeDef extends BaseTermDef<CompositeType.compound>, CompoundCommandDef<Term, RedirectComposite> {}

interface CompoundCommandDef<T, RedirType> {
  /**
   * Cannot be null i.e. if only have redirects
   * we'd get a simple command instead (originally {CallExpr}).
   */
  child: T;
  /**
   * Compound commands can be redirected.
   */
  redirects: RedirType[];
  /** Run in background? */
  background: boolean;
  /** Binary-negate return code? */
  negated: boolean;
}
