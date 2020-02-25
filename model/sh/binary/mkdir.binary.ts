import { BinaryExecType } from '@model/sh/binary.model';
import { BaseBinaryComposite } from './base-binary';
import { ObservedType } from '@service/term.service';
import { OsDispatchOverload } from '@model/os.redux.model';
import { osMkDirThunk } from '@store/os/file.os.duck';

export class MkdirBinary extends BaseBinaryComposite<
  BinaryExecType.mkdir,
  { string: never[]; boolean: 'p'[] }
> {

  public specOpts() {
    return { string: [], boolean: ['p'] as 'p'[] };
  }

  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    for (const path of this.operands) {
      try {
        dispatch(osMkDirThunk({ processKey, path, makeSuper: this.opts.p }));
      } catch (e) {
        this.exitCode = 1;
        yield this.warn(`${path}: no such file or directory`);
      }
    }
  }

}
