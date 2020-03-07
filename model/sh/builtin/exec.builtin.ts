import { BaseBuiltinComposite, BaseBuiltinCompositeDef } from './base-builtin';
import { BuiltinSpecialType } from '../builtin.model';
import { RedirectComposite } from '../composite/redirect.composite';
import { ObservedType } from '@os-service/term.service';
import { OsDispatchOverload } from '@model/os/os.redux.model';
import { osParseShThunk, osTranspileShThunk, osDistributeSrcThunk } from '@store/os/parse.os.duck';
import { CompositeType } from '@model/os/term.model';
import { osExecTermThunk, osStartProcessThunk } from '@store/os/process.os.duck';

/**
 * Exec is special.
 * We don't mount a term; we replace root of term-tree.
 */
export class ExecBuiltin extends BaseBuiltinComposite<BuiltinSpecialType.exec> {
  /** Attached by `SimpleComposite`. */
  public redirects: RedirectComposite[];

  constructor(public def: BaseBuiltinCompositeDef<BuiltinSpecialType.exec>) {
    super(def);
    this.redirects = [];
  }

  public specOpts() {
    return { string: [], boolean: [] };
  }

  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    if (!this.def.args[0]) {// If only redirects, apply in current scope
      for (const redirect of this.redirects) {
        yield* this.runChild({ child: redirect, dispatch, processKey });
      }
      yield this.exit(0);
    }

    // Otherwise append redirect's source code to args and parse
    const src = this.def.args.concat(
      this.redirects.map((redirect) => redirect.def.src || '')).join(' ');
    const parse = dispatch(osParseShThunk({ src }));
    if (parse.key === 'failed') return yield this.exit(1, parse.error);
    const term = dispatch(osTranspileShThunk({ parsed: parse.parsed }));
    dispatch(osDistributeSrcThunk({ src, term }));

    // Ensure transpilation is a simple command (?)
    if (term.key !== CompositeType.simple) {
      return yield this.exit(1, `'${src}' not recognised as simple command`);
    }

    // TODO ensure args[0] executable i.e. func, builtin, or binary (?)
    dispatch(osExecTermThunk({ processKey, term }));
    dispatch(osStartProcessThunk({ processKey }));

    yield this.exit(this.exitCode || 0); // Unreachable?
  }

}
