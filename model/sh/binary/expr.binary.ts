import { BinaryExecType } from '@model/sh/binary.model';
import { ObservedType } from '@os-service/term.service';
import { BaseBinaryComposite } from './base-binary';

/**
 * Wraps native javascript `eval`, so be careful.
 */
export class ExprBinary extends BaseBinaryComposite<
BinaryExecType.expr,
{ string: never[]; boolean: ('v' | 'i')[] }
> {
  private readonly maxLines = 100;

  public specOpts() {
    return { string: [], boolean: ['v', 'i'] as ('v' | 'i')[] };
  }

  public async *semantics(): AsyncIterableIterator<ObservedType> {
    let input: string;
    const buffer = [] as string[];

    if (this.opts.v) {
      while (yield this.read(this.maxLines, 0, buffer));
      // We assume stdin doesn't mention single quotes
      const arrayArg = this.opts.i
        ? buffer.map(x => Number(x))
        : buffer.map(x => `'${x}'`);
      input = `(${this.operands.join('')})([${arrayArg}])`;
    } else if (!this.operands.length) {
      while (yield this.read(this.maxLines, 0, buffer));
      input = buffer.join('\n');
    } else {
      input = this.operands.join(' ');
    }

    const result = eval(input);

    if (typeof result === 'number' || typeof result === 'boolean') {
      yield this.write(`${result}`);
    } else if (Array.isArray(result)) {
      if (typeof result[0] === 'number' || typeof result[0] === 'boolean') {
        // Assume array has uniform type
        yield this.write(result.map(x => `${x}`));
      }
      yield this.write(result.flatMap(x => `${x}`.replace(/\r+/g, '').split('\n')));
    } else {
      yield this.write(result.replace(/\r+/g, '').split('\n'));
    }
  }

}
