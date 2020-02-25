import { BaseTerm } from '@model/sh/base-term';
import { CompositeType, Term, ExpandComposite } from '@model/term.model';
import { OsDispatchOverload } from '@model/os.redux.model';
import { RedirectComposite } from './redirect.composite';
import { AssignComposite } from './assign.composite';
import { CodeStackItem } from '@model/process.model';
import { ObservedType } from '@service/term.service';
import { iterateTerm } from '@service/term.util';
import { osPushRedirectScopeAct, osPopRedirectScopeAct, osPushPositionalsScopeAct, osPopPositionalsScopeAct, osExpandVarThunk } from '@store/os/declare.os.duck';
import { osPushCodeStackAct, osPopCodeStackAct } from '@store/os/process.os.duck';
import { ArithmOpComposite } from './arithm-op.composite';

/**
 * base composite term.
 */
export abstract class BaseCompositeTerm<ExactKey extends CompositeType> extends BaseTerm<ExactKey> {
  public readonly type = 'composite';

  /**
   * Run a child term.
   * Propagate break, continue and return.
   * Optionally applies redirections in new redirection scope, auto-released when child finishes.
   * Optionally applies +ve positionals in new variable scope, auto-removed when child finishes.
   */
  protected async *runChild(
    { child, dispatch, processKey }: {
      child: Term;
      dispatch: OsDispatchOverload;
      processKey: string;
    },
    opts?: {
      freshRedirs?: RedirectComposite[];
      posPositionals?: string[];
      /** Used when invoking functions or sourced scripts. */
      exportAssigns?: AssignComposite[];
      codeStackItem?: CodeStackItem;
    },
  ): AsyncIterableIterator<ObservedType> {

    if (opts) {
      if (opts.freshRedirs && opts.freshRedirs.length) {
        // Apply redirections in new redirection scope.
        dispatch(osPushRedirectScopeAct({ processKey }));
        for (const redirect of opts.freshRedirs) {
          yield* this.runChild({ child: redirect, dispatch, processKey });
          if (redirect.exitCode) {// Exit on failed redirect.
            dispatch(osPopRedirectScopeAct({ processKey }));
            yield this.exit(redirect.exitCode);
            return;
          }
        }
      }
      if (opts.posPositionals) {
        // Create new variable scope with new positional params.
        dispatch(osPushPositionalsScopeAct({ processKey, posPositionals: opts.posPositionals }));
      }
      if (opts.exportAssigns) {
        // Apply assigns locally, and export.
        for (const assign of opts.exportAssigns) {
          assign.declOpts = { local: true, exported: true };
          yield* this.runChild({ child: assign, dispatch, processKey });
          /**
           * Don't exit on failed assign e.g.
           * `x=$( <foo ) y=bar` assigns y when foo n'exist pas.
           *  TODO assignExitCode to track bad assigns.
           */
        }
      }
      if (opts.codeStackItem) {
        dispatch(osPushCodeStackAct({ processKey, item: opts.codeStackItem }));
      }
    }

    // Run the child term.
    // yield* child.semantics(dispatch, processKey);
    yield* iterateTerm({ term: child, dispatch, processKey });

    if (opts) {
      if (opts.freshRedirs && opts.freshRedirs.length) {
        // Release redirect scope.
        dispatch(osPopRedirectScopeAct({ processKey }));
      }
      if (opts.posPositionals) {
        // Release var scopes up to and including 1st positionals.
        dispatch(osPopPositionalsScopeAct({ processKey }));
      }
      if (opts.codeStackItem) {
        dispatch(osPopCodeStackAct({ processKey }));
      }
    }

    if (this.breakDepth || this.continueDepth || this.returnCode !== null) {
      if (this.breakDepth) {
        // Detected break, so propagate to parent.
        this.parent && (this.parent.breakDepth = this.breakDepth);
      } else if (this.continueDepth) {
        // Detected continue.
        this.parent && (this.parent.continueDepth = this.continueDepth);
      } else if (this.returnCode !== null) {
        // Detected function return.
        if (this.parent) {
          if (this.parent.key === CompositeType.simple
            && this.parent.method
            && this.parent.method.key === 'invoke-function'
          ) {
            // Reached invoker, so don't propagate.
          } else {
            this.parent.returnCode = this.returnCode;
          }
        }
      }
      return yield this.exit(0);
    }
    // Propagate exit code, although often not the final exitCode of {this}.
    this.exitCode = child.exitCode;
  }

  /**
   * Run arithmetic expression {child}, assigning appropriate value to {parent}.
   * The {parent} should be an {arithm_op} or {expand}.
   */
  protected async *runArithmExpr({ child, dispatch, processKey }: {
    child: ArithmOpComposite | ExpandComposite;
    dispatch: OsDispatchOverload;
    processKey: string;
  }): AsyncIterableIterator<ObservedType> {

    yield* this.runChild({ child, dispatch, processKey });

    let x: number;
    if (child.key === CompositeType.arithm_op) {
      x = child.value;
    } else {// Try interpreting as number.
      x = parseInt(String(child.value));
      if (Number.isNaN(x)) {
        // Otherwise, try looking up variable.
        const varValue = dispatch(osExpandVarThunk({ processKey, varName: String(child.value) }));
        x = parseInt(varValue) || 0;
      }
    }

    const parent = child.parent;
    if (parent) {
      if (parent.key === CompositeType.arithm_op) {
        parent.value = x;
      } else if (parent.key === CompositeType.expand) {
        parent.value = String(x);
      }
    }
  }

}

export interface CompositeChildren<T> {
  /** Children in applicable composites. */
  cs: T[];
}
