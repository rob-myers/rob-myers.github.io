import { BaseBuiltinComposite } from './base-builtin';
import { BuiltinSpecialType } from '../builtin.model';
import { ObservedType } from '@os-service/term.service';
import { OsDispatchOverload } from '@model/os/os.redux.model';
import { osGetProcessThunk } from '@store/os/process.os.duck';

export class ReturnBuiltin extends BaseBuiltinComposite<BuiltinSpecialType.return> {

  public specOpts() {
    return { string: [], boolean: [] };
  }

  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    // Check if ProcessState.codeStack non-empty.
    const { codeStack } = dispatch(osGetProcessThunk({ processKey }));
    if (!codeStack.length) {
      yield this.exit(1, 'can only `return\' from a function or sourced script');
    }

    // Set return code in parent.
    (this.parent!).returnCode = parseInt(this.def.args[0] || '') || 0;
    yield this.exit();
  }

}
