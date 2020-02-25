import { BuiltinSpecialType, BuiltinOtherType } from '../builtin.model';
import { BaseBuiltinComposite, BaseBuiltinCompositeDef } from './base-builtin';
import { AssignComposite } from '../composite/assign.composite';
import { Term } from '@model/os/term.model';
import { ObservedType } from '@service/term.service';
import { OsDispatchOverload } from '@model/os/os.redux.model';
import { osOpenFileThunk, osCloseFdAct } from '@store/os/file.os.duck';
import { INodeType } from '@store/inode/base-inode';
import { osParseShThunk, osTranspileShThunk, osDistributeSrcThunk } from '@store/os/parse.os.duck';

export abstract class PeriodOrSourceBuiltin<
  Key extends BuiltinSpecialType.period | BuiltinOtherType.source
> extends BaseBuiltinComposite<Key> {
  /**
   * Attached by {SimpleComposite}.
   */
  public assigns: AssignComposite[];

  public get children() {
    return this.mounted ? [this.mounted] : [];
  }
  /**
   * The term induced by the script.
   */
  public mounted: null | Term;
  

  constructor(public def: BaseBuiltinCompositeDef<Key>) {
    super(def);
    this.assigns = [];
    this.mounted = null;
  }

  public specOpts() {
    return { string: [], boolean: [] };
  }

  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    const srcPath = this.operands[0];
    
    if (!srcPath) {
      yield this.exit(1, 'filename argument required');
    }

    /**
     * Open at next available fd, not stdin, in case we're sourcing a script.
     * _TODO_ Ensure >= 10.
     */
    try {
      const { fd, iNode } = dispatch(osOpenFileThunk({ processKey, request: { path: srcPath, mode: 'RDONLY' } }));

      // Cannot run regular files which are binaries.
      if (iNode.type === INodeType.regular && iNode.binary) {
        dispatch(osCloseFdAct({ processKey, fd }));
        yield this.exit(1, `${srcPath}: cannot source binary file`);
      }

      /**
       * Greedy read, since cannot 'partially parse' a script.
       */
      const buffer = [] as string[];
      yield this.read(Number.MAX_SAFE_INTEGER, fd, buffer);
      dispatch(osCloseFdAct({ processKey, fd }));

      /**
       * Parse and transpile.
       */
      const src = buffer.join('\n');
      const parseResult = dispatch(osParseShThunk({ src }));
      if (parseResult.key === 'failed') {
        yield this.exit(1, parseResult.error);
        return; // For typescript.
      }
      const term = dispatch(osTranspileShThunk({ parsed: parseResult.parsed }));

      /**
       * Mount, store src, distribute to subterms.
       */
      this.mounted = term;
      this.adoptChildren();
      this.def.src = src; // ?
      dispatch(osDistributeSrcThunk({ src, term }));
      /**
       * Run script in current process, setting positionals in new scope.
       */
      yield* this.runChild({ child: term, dispatch, processKey }, {
        posPositionals: this.operands.slice(1),
        exportAssigns: this.assigns, 
        codeStackItem: { key: 'script', scriptPath: srcPath, src },
      });

    } catch (e) {
      console.error(e);
    }

  }


}

export class PeriodBuiltin extends PeriodOrSourceBuiltin<BuiltinSpecialType.period> {}
