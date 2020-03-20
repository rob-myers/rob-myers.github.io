import { BinaryExecType } from '@model/sh/binary.model';
import { BaseBinaryComposite } from './base-binary';
import { ObservedType } from '@os-service/term.service';
import { OsDispatchOverload } from '@model/os/os.redux.model';
import { osGetProcessesMeta } from '@store/os/process.os.duck';

export class PsBinary extends BaseBinaryComposite<BinaryExecType.ps> {

  public specOpts() {
    return { string: [], boolean: [] };
  }

  public async *semantics(dispatch: OsDispatchOverload): AsyncIterableIterator<ObservedType> {
    yield this.write('PID'.padEnd(7) + 'TTY'.padEnd(9) + 'CMD');
    const { metas } = dispatch(osGetProcessesMeta({}));
    for (const { pid, ttyName, command } of metas) {
      yield this.write(`${pid}`.padEnd(7) + `${ttyName || ''}`.padEnd(9) + `${command}`);
    }
  }

}
