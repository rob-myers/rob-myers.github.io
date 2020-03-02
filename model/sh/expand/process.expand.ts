import generate from 'shortid';
import { BaseExpandComposite, BaseExpandCompositeDef } from './base-expand';
import { CompositeChildren } from '../composite/base-composite';
import { Term } from '@model/os/term.model';
import { ExpandType } from '../expand.model';
import { ObservedType } from '@os-service/term.service';
import { OsDispatchOverload } from '@model/os/os.redux.model';
import { osMakeFifoThunk } from '@store/os/file.os.duck';
import { BaseSpawnDef, osSpawnChildThunk } from '@store/os/process.os.duck';
import { osCloneTerm } from '@store/os/parse.os.duck';

export class ProcessExpand extends BaseExpandComposite<ExpandType.process> {

  constructor(public def: ProcessExpandDef) {
    super(def);
  }

  public get children() {
    return this.def.cs;
  }

  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    // Create pipe.
    const childProcessKey = `pipe.psub-${generate()}.${processKey}`;
    const capacity = 10;
    const pipePath = `/tmp/${childProcessKey}`;
    dispatch(osMakeFifoThunk({ processKey, path: pipePath, capacity }));

    const redirects: BaseSpawnDef['redirects'] = [
      this.def.dir === '<'
        // <( ... ) Current process reads from pipe, spawned writes to it.
        ? { fd: 1, mode: 'WRONLY', path: pipePath }
        // >( ... ) Current process writes to pipe, spawned reads from it.
        : { fd: 0, mode: 'RDONLY', path: pipePath },
    ];

    // Spawn background process
    dispatch(osSpawnChildThunk({
      processKey,
      background: true,
      childProcessKey,
      posPositionals: [],
      redirects,
      term: dispatch(osCloneTerm({ term: this.def.cs })),  
    }));

    // Write path to pipe.
    this.value = pipePath;

    /**
     * TODO cannot unlink yet and don't want to unlink on redirect.
     * Perhaps mark pipe to auto-destruct?
     */
    // yield this.dispatch(unlinkFileThunk({ processKey, path: pipePath }));

    yield this.exit(0);
  }
}

interface ProcessExpandDef extends BaseExpandCompositeDef<ExpandType.process>, BaseProcessDef<Term> {}

interface BaseProcessDef<T> extends CompositeChildren<T> {
  dir: '<' | '>';
}
