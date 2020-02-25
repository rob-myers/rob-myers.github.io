import { BinaryExecType } from '@model/sh/binary.model';
import { BaseBinaryComposite } from './base-binary';
import { ObservedType } from '@service/term.service';
import { OsDispatchOverload } from '@model/redux.model';
import { osRemoveDirThunk } from '@store/os/file.os.duck';

export class RmdirBinary extends BaseBinaryComposite<BinaryExecType.rmdir> {

  public specOpts() {
    return { string: [], boolean: [] };
  }

  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    for (const dirpath of this.operands) {
      try {
        dispatch(osRemoveDirThunk({ processKey, path: dirpath }));
      } catch (e) {// Propagate {TermError}.
        this.exitCode = 1;
        yield this.warn(e); 
      }
    }
  }

}
