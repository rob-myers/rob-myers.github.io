import { BinaryExecType } from '@model/sh/binary.model';
import { BaseBinaryComposite } from './base-binary';
import { ObservedType } from '@service/term.service';
import { OsDispatchOverload } from '@model/os.redux.model';
import { osRealPathThunk } from '@store/os/file.os.duck';

export class RealpathBinary extends BaseBinaryComposite<BinaryExecType.realpath> {

  public specOpts() {
    return { string: [], boolean: [] };
  }

  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    for (const filepath of this.operands) {
      try {
        yield this.write(dispatch(osRealPathThunk({ processKey, path: filepath })));
      } catch (e) {
        yield this.warn(`${filepath}: no such file or directory`);
        this.exitCode = 1;
        continue;
      }
    }
  }

}
