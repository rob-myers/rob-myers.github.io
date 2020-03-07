import { BaseBuiltinComposite, BaseBuiltinCompositeDef } from './base-builtin';
import { BuiltinSpecialType } from '../builtin.model';
import { Term } from '@model/os/term.model';
import { ObservedType } from '@os-service/term.service';
import { OsDispatchOverload } from '@model/os/os.redux.model';
import { osParseShThunk, osTranspileShThunk, osDistributeSrcThunk } from '@store/os/parse.os.duck';

/**
 * Parse args, mounting respective term.
 */
export class EvalBuiltin extends BaseBuiltinComposite<BuiltinSpecialType.eval> {

  public get children() {
    return this.mounted ? [this.mounted] : [];
  }

  public mounted: null | Term;

  constructor(public def: BaseBuiltinCompositeDef<BuiltinSpecialType.eval>) {
    super(def);
    this.mounted = null;
  }

  public onEnter() {
    super.onEnter();
    this.mounted = null;
  }

  public specOpts() {
    return { string: [], boolean: [] };
  }

  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    this.def.src = this.def.args.join(' ');
    const parse = dispatch(osParseShThunk({ src: this.def.src }));

    if (parse.key === 'parsed') {
      const term = dispatch(osTranspileShThunk({ parsed: parse.parsed }));
      dispatch(osDistributeSrcThunk({ src: this.def.src, term }));
      this.mounted = term;
      this.adoptChildren();

      yield* this.runChild({ child: term, dispatch, processKey });
      yield this.exit(this.exitCode || 0);
    } else {
      yield this.exit(1, parse.error);
    }
  }

}
