import { BinaryExecType } from '@model/sh/binary.model';
import { BaseBinaryComposite } from './base-binary';
import { ObservedType } from '@os-service/term.service';

export class PsBinary extends BaseBinaryComposite<BinaryExecType.ps> {

  public specOpts() {
    return { string: [], boolean: [] };
  }

  public async *semantics(): AsyncIterableIterator<ObservedType> {
    yield this.write('PS');
  }

}
