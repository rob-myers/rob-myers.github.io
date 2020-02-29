import { BinaryExecType } from '@model/sh/binary.model';
import { BaseBinaryComposite } from './base-binary';
import { ObservedType } from '@os-service/term.service';

export class SleepBinary extends BaseBinaryComposite<BinaryExecType.sleep> {

  public get children() {
    return [];
  }

  public specOpts() {
    return { string: [], boolean: [] };
  }

  public async *semantics(): AsyncIterableIterator<ObservedType> {
    if (!this.operands.length) {
      yield this.exit(1, 'missing operand');
    }
    
    // Sleep sum of operands, where each must be non-negative.
    let seconds = 0, delta: number;
    for (const operand of this.operands) {
      seconds += (delta = Number(operand));
      if (Number.isNaN(delta) || (delta < 0)) {
        yield this.exit(1, `invalid time interval ‘${operand}’`);
      }
    }
    await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  }

}
