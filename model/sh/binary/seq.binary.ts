import { BinaryExecType } from '@model/sh/binary.model';
import { BaseBinaryComposite } from './base-binary';
import { ObservedType } from '@os-service/term.service';

export class SeqBinary extends BaseBinaryComposite<BinaryExecType.seq> {

  public specOpts() {
    return { string: [], boolean: [] };
  }

  public async *semantics(): AsyncIterableIterator<ObservedType> {
    /**
     * Args without prefix '-', but also e.g. '-1'.
     */
    const operands = this.def.args.filter((x) => /^[^-]|(-\d+$)/.test(x) );

    if (!operands.length) {
      yield this.exit(1, 'missing operand');
    } else if (operands.length >= 3) {
      yield this.exit(1, 'too many operands');
    }
    
    if (operands.length === 1) {
      /**
       * seq {last} where {last} is an integer.
       * Output 1 ... {last} non-empty iff {last} is positive.
       */
      const last = parseInt(operands[0]);
      if (operands[0] !== `${last}`) {
        yield this.exit(1, `invalid integer argument: '${operands[0]}'`);
      }
      yield this.write(Array.from(new Array(last), (_, i) => `${i + 1}`));
    }

    if (operands.length === 2) {
      /**
       * seq {first} {last} where both are integers.
       */
      const [first, last] = operands.map((x) => parseInt(x));
      const badIndex = [first, last].findIndex((x, i) => `${x}` !== operands[i]);
      if (badIndex !== -1) {
        yield this.exit(1, `invalid integer argument: '${operands[badIndex]}'`);
      }
      const delta = Math.sign(last - first);
      yield this.write(Array.from(new Array(Math.abs(last - first) + 1), (_, i) => `${first + (i * delta)}`));
    }
  }

}
