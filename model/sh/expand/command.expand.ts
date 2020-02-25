import { BaseExpandComposite, BaseExpandCompositeDef } from './base-expand';
import { CompositeChildren } from '../composite/base-composite';
import { Term, CompositeType } from '@model/os/term.model';
import { ExpandType } from '../expand.model';
import { ObservedType } from '@service/term.service';
import { OsDispatchOverload } from '@model/os/os.redux.model';
import { osOpenTempThunk, osResolvePathThunk, osCloseFdAct, osUnlinkFileThunk } from '@store/os/file.os.duck';
import { osGetPositionalsThunk } from '@store/os/declare.os.duck';
import { osSpawnChildThunk } from '@store/os/process.os.duck';
import { SeqComposite } from '../composite/seq.composite';
import { osCloneTerm } from '@store/os/parse.os.duck';
import { RegularINode } from '@store/inode/regular.inode';

/**
 * Command substitution.
 */
export class CommandExpand extends BaseExpandComposite<ExpandType.command> {

  public get children() {
    return this.def.cs;
  }

  public launchedKey: null | string;

  constructor(public def: CommandExpandDef) {
    super(def);
    this.launchedKey = null;
  }

  public onEnter() {
    super.onEnter();
    this.launchedKey = null;
  }

  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    /**
     * Create temporary file for stdout.
     */
    const { fd: tempFd, tempPath } = dispatch(osOpenTempThunk({ processKey }));
   
    /**
     * Spawn child with commands.
     */
    this.launchedKey = `cmd-${this.termId}.${processKey}`;

    const { toPromise } = dispatch(osSpawnChildThunk({
      processKey,
      childProcessKey: this.launchedKey,
      term: new SeqComposite({
        key: CompositeType.seq,
        cs: this.def.cs.map((child) => dispatch(osCloneTerm({ term: child }))),
        sourceMap: this.def.sourceMap,
        comments: this.def.comments,
        // Propagate distributed source to root term.
        src: this.def.src,
      }),
      /**
       * Redirect stdout to temp file.
       */
      redirects: [{ fd: 1, mode: 'WRONLY', path: tempPath }],
      /**
       * Inherit +ve positionals $1, ($0 auto-inherited).
       */
      posPositionals: dispatch(osGetPositionalsThunk({ processKey })).slice(1),
    }));

    /**
     * Wait for child process to terminate.
     */
    if (toPromise) {
      await toPromise();
    }

    /**
     * Expand contents i.e. store as {this.value}.
     */
    const { iNode } = dispatch(osResolvePathThunk({ processKey, path: tempPath }));
    const contents = (iNode as RegularINode).data.join('\n');
    // Command substitution discards trailing newlines.
    this.value = contents.replace(/\n*$/, '');

    /**
     * Close and remove temporary file.
     */
    dispatch(osCloseFdAct({ processKey, fd: tempFd }));
    dispatch(osUnlinkFileThunk({ processKey, path: tempPath })); 
  }
}

interface CommandExpandDef extends BaseExpandCompositeDef<ExpandType.command>, CompositeChildren<Term> {}
