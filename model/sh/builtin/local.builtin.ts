import { BuiltinOtherType } from '../builtin.model';
import { BaseDeclareComposite } from './base-declare';
import { ObservedType } from '@os-service/term.service';
import { OsDispatchOverload } from '@model/os/os.redux.model';
import { insideInvokedFunction } from '@model/os/service/term.util';

export class LocalBuiltin extends BaseDeclareComposite<BuiltinOtherType.local> {

  public specOpts() {
    return { string: [], boolean: [] };
  }

  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    yield* this.computeOpts(dispatch, processKey);

    if (!insideInvokedFunction(this)) {
      yield this.exit(1, 'can only be used in a function');
    }
    /**
     * No need to push/pop variable scope here, because handled by
     * SimpleComposite.*invokeFunction via BaseComposite.*runChild.
     */
    let exitCode = 0;
    for (const assign of this.def.assigns) {
      assign.declOpts = { local: true };
      yield* this.runChild({ child: assign, dispatch, processKey });
      exitCode = assign.exitCode || 0;
    }

    yield this.exit(exitCode);
  }

}
