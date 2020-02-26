import { BaseTermDef } from '../base-term';
import { CompositeType, Term } from '../../os/term.model';
import { BaseCompositeTerm, CompositeChildren } from './base-composite';
import { ObservedType } from '@service/term.service';
import { OsDispatchOverload } from '@model/os/os.redux.model';
import { osSpawnChildThunk, osGetProcessThunk } from '@store/os/process.os.duck';
import { SeqComposite } from './seq.composite';

/**
 * subshell
 */
export class SubshellComposite extends BaseCompositeTerm<CompositeType.subshell> {
  public childProcessKey!: string;

  public get children() {
    return this.def.cs.slice();
  }

  constructor(public def: SubshellCompositeDef) {
    super(def);
  }

  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    this.childProcessKey = `${this.termId}.${processKey}`;

    const { def } = this;
    if (!def.cs.length) {
      yield this.exit(0);
      return;
    }

    const { toPromise } = dispatch(osSpawnChildThunk({
      childProcessKey: this.childProcessKey,
      posPositionals: [],
      processKey,
      redirects: [],
      term: new SeqComposite({
        key: CompositeType.seq,
        cs: def.cs,
        sourceMap: def.sourceMap,
        comments: def.comments,
        src: def.src,
      }),
      subshell: true,
    }));

    if (toPromise) {
      await toPromise();
    }

    // TODO ensure last exit code available
    const child = dispatch(osGetProcessThunk({ processKey: this.childProcessKey }));
    const exitCode = child ? child.lastExitCode || 0 : 0;
    yield this.exit(exitCode);
  }
}

interface SubshellCompositeDef extends BaseTermDef<CompositeType.subshell>, CompositeChildren<Term> {}
