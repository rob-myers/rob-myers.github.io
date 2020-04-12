import { BaseTermDef } from '../base-term';
import { CompositeType, Term } from '../../os/term.model';
import { BaseCompositeTerm, CompositeChildren } from './base-composite';
import { ObservedType } from '@os-service/term.service';
import { OsDispatchOverload } from '@model/os/os.redux.model';
import { launchedInteractively } from '@os-service/term.util';
import { last } from '@model/generic.model';
import { osMakeFifoThunk, osUnlinkFileThunk } from '@store/os/file.os.duck';
import { osSpawnChildThunk, BaseSpawnDef, osStartProcessThunk, osWaiterThunk, osGetProcessThunk } from '@store/os/process.os.duck';
import { osCloneTerm } from '@store/os/parse.os.duck';
import { osSetSessionForegroundAct } from '@store/os/session.os.duck';
import { osGetPositionalsThunk } from '@store/os/declare.os.duck';

/**
 * pipe.
 * 
 * - Create a fifo per child.
 * - Spawn each child suspended in background.
 * - If launched interactively, process group is {processKey} of last process.
 * - Stdout of Process i writes to fifo i.
 * - Stdin of Process i+1 reads from fifo i.
 * - Stdin of 1st process inherited, stdout of last process inherited.
 * - Wait for last process to terminate.
 * - Remove fifos.
 */
export class PipeComposite extends BaseCompositeTerm<CompositeType.pipe> {

  public get children() {
    return this.def.cs;
  }

  constructor(public def: PipeCompositeDef) {
    super(def);
  }

  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    if (!this.def.cs.length) {// Degenerate case
      yield this.exit();
    }

    // Suffix for child process keys
    const rootKey = `${this.termId}.${processKey}`;
    // Child process keys
    const childKeys = this.def.cs.map((_, i) => `${i}.${rootKey}`);
    // One less pipe than there are children
    const pipePaths = childKeys
      .slice(0, -1)
      .map((_, i) => `/tmp/${i}-to-${i + 1}.${rootKey}`);

    const interactive = launchedInteractively(this);
    const lastChildKey = last(childKeys) as string;
    const childCount = this.def.cs.length;

    for (const pipePath of pipePaths) {// Create fifos
      dispatch(osMakeFifoThunk({ processKey, path: pipePath, capacity: this.def.capacity }));
    }

    // Spawn redirected child processes, suspended in background
    for (let i = 0; i < childCount; i++) {
      dispatch(osSpawnChildThunk({
        processKey,
        childProcessKey: childKeys[i],
        term: dispatch(osCloneTerm({ term: this.def.cs[i] })),
        redirects: ([] as BaseSpawnDef['redirects']).concat(
          // (i+1)^th process reads from i^th pipe
          (i === 0) ? [] : [{ fd: 0, mode: 'RDONLY', path: pipePaths[i - 1] }],
          // (i-1)^th process writes to (i-1)^th pipe
          (i === (childCount - 1)) ? [] : [{ fd: 1, mode: 'WRONLY', path: pipePaths[i] }],
        ),
        background: true,// So cannot affect foreground
        suspend: true,
        // If pipe launched interactively, put processes in new group `lastChildKey`
        specPgKey: interactive ? lastChildKey : undefined,
        posPositionals: dispatch(osGetPositionalsThunk({ processKey })).slice(1),
      }));
    }

    if (interactive) {// Set children's process group as foreground
      dispatch(osSetSessionForegroundAct({ processKey, processGroupKey: lastChildKey }));
    }
    
    for (const childProcessKey of childKeys) {// Start child processes
      dispatch(osStartProcessThunk({ processKey: childProcessKey }));
    }
    /**
     * Wait for all children to terminate.
     * Alternatively: wait for final child `[lastChildKey]`.
     */
    // const { toPromise } = dispatch(osWaiterThunk({ processKey, waitFor: [lastChildKey] }));
    const { toPromise } = dispatch(osWaiterThunk({ processKey, waitFor: childKeys }));
    if (toPromise) {
      await toPromise();
    }
    // Propagate exit code of final child
    this.exitCode = dispatch(osGetProcessThunk({ processKey })).lastExitCode;
    
    for (const pipePath of pipePaths) {// Remove fifos
      dispatch(osUnlinkFileThunk({ processKey, path: pipePath }));
    }
  }
}
interface PipeCompositeDef extends BaseTermDef<CompositeType.pipe>, CompositeChildren<Term>, PipeDef {
}

export interface PipeDef {
  capacity: number;
}