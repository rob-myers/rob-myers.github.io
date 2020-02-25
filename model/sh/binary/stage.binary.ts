import { BinaryGuiType } from '@model/sh/binary.model';
import { BaseBinaryComposite } from './base-binary';
import { ObservedType } from '@service/term.service';
import { OsDispatchOverload } from '@model/os/os.redux.model';

/**
 * stage.
 */
export class StageBinary extends BaseBinaryComposite<BinaryGuiType.stage> {

  public specOpts() {
    return { string: [], boolean: [] };
  }

  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    yield* this.runGui(dispatch, processKey);
  }
}
