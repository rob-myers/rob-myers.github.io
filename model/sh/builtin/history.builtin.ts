import { BaseBuiltinComposite } from './base-builtin';
import { ObservedType } from '@os-service/term.service';
import { OsDispatchOverload } from '@model/os/os.redux.model';
import { BuiltinOtherType } from '../builtin.model';
import { osOpenFileThunk } from '@store/os/file.os.duck';
import { osGetProcessThunk } from '@store/os/process.os.duck';


export class HistoryBuiltin extends BaseBuiltinComposite<BuiltinOtherType.history> {

  public specOpts() {
    return { string: [], boolean: [] };
  }

  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    const [maxLines, historyFd] = [10, 10];
    const { userKey } = dispatch(osGetProcessThunk({ processKey }));
    dispatch(osOpenFileThunk({
      processKey,
      request: { mode: 'RDONLY', path: `/home/${userKey}/.history`, fd: historyFd },
    }));

    while (yield this.read(maxLines, historyFd)) {
      yield this.write();
    }
  }

}
