import { BinaryExecType } from '@model/sh/binary.model';
import { BaseBinaryComposite } from './base-binary';
import { ObservedType } from '@service/term.service';
import { osUnlinkFileThunk } from '@store/os/file.os.duck';
import { OsDispatchOverload } from '@model/os.redux.model';

export class RmBinary extends BaseBinaryComposite<BinaryExecType.rm> {

  public specOpts() {
    return { string: [], boolean: [] };
  }

  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    for (const filepath of this.operands) {
      try {
        dispatch(osUnlinkFileThunk({ processKey, path: filepath }));
      } catch (e) {// Propagate {TermError}.
        this.exitCode = 1;
        yield this.warn(e);
      }
    }
  }

}
