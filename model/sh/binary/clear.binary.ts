import { BinaryExecType } from '@model/sh/binary.model';
import { BaseBinaryComposite } from './base-binary';
import { ObservedType } from '@service/term.service';
import { OsDispatchOverload } from '@model/os.redux.model';
import { osClearTtyThunk } from '@store/os/tty.os.duck';

export class ClearBinary extends BaseBinaryComposite<BinaryExecType.clear> {

  public specOpts() {
    return { string: [], boolean: [] };
  }

  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    dispatch(osClearTtyThunk({ processKey }));
  }

}
