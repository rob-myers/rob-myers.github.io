import { BinaryExecType } from '@model/sh/binary.model';
import { BaseBinaryComposite } from './base-binary';
import { ObservedType } from '@os-service/term.service';
import { osGetOfdThunk } from '@store/os/file.os.duck';
import { OsDispatchOverload } from '@model/os/os.redux.model';
import { INodeType } from '@store/inode/base-inode';

export class TtyBinary extends BaseBinaryComposite<BinaryExecType.tty> {

  public specOpts() {
    return { string: [], boolean: [] };
  }

  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    try {
      const { iNode } = dispatch(osGetOfdThunk({ processKey, fd: 0 }));
      if (iNode.type === INodeType.tty) {
        yield this.write(iNode.def.canonicalPath);
      }
    } catch (e) {
      // NOOP
    }
  }

}
