import { BinaryExecType } from '@model/sh/binary.model';
import { BaseBinaryComposite } from './base-binary';
import { ObservedType } from '@os-service/term.service';
import { OsDispatchOverload } from '@model/os/os.redux.model';
import { osMkDirThunk } from '@store/os/file.os.duck';
import { TermError } from '@model/os/service/term.util';

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
        if (e instanceof TermError) {
          yield this.warn(e.message);
          this.exitCode = e.exitCode;
        } else throw e;
      }
    }
    yield this.exit(this.exitCode || 0);
  }

}
