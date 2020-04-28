import { BinaryExecType } from '@model/sh/binary.model';
import { BaseBinaryComposite } from './base-binary';
import { ObservedType } from '@os-service/term.service';
import { OsDispatchOverload } from '@model/os/os.redux.model';
import { osMakeFifoThunk } from '@store/os/file.os.duck';
import { TermError } from '@model/os/service/term.util';

export class MkFifoBinary extends BaseBinaryComposite<
  BinaryExecType.mkfifo,
  { string: never[]; boolean: never[] }
> {

  public specOpts() {
    return { string: [], boolean: [] };
  }

  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    for (const path of this.operands) {
      try {
        dispatch(osMakeFifoThunk({ processKey, path }));
      } catch (e) {
        if (e instanceof TermError) {
          yield this.warn(e.message);
          this.exitCode = e.exitCode;
        } else throw e;
      }
    }
    yield this.exit(this.exitCode || 0);
  }

}
