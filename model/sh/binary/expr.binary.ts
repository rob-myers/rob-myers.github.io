import { BinaryExecType } from '@model/sh/binary.model';
import { ObservedType } from '@os-service/term.service';
import { BaseBinaryComposite } from './base-binary';

/**
 * Permit arbitary functions via `Function('...')`,
 * so need to be careful. Runs in web worker without window.
 * 
 * Examples
 * - `seq 10 | expr -vi 'xs => xs.reduce((sum, x) => sum + x, 0)'`
 * - `seq 10 | expr -vi 'xs => xs.map(x => x + 1)'`
 * - `seq 10000 | expr -mi 'x => x + 1' >foo`
 */
export class ExprBinary extends BaseBinaryComposite<
BinaryExecType.expr,
{ string: never[]; boolean: ('v' | 'i' | 'm')[] }
> {
  private readonly maxLines = 1000000;

  public specOpts() {
    return { string: [], boolean: ['v', 'i'] as ('v' | 'i')[] };
  }

  public async *semantics(): AsyncIterableIterator<ObservedType> {
    let result: any;
    const buffer = [] as string[];

    if (this.opts.v) {// Pass stdin as array of strings/integers
      const unaryFuncText = this.operands.join('');
      while (yield this.read(this.maxLines, 0, buffer));
      const arrayArg = this.opts.i ? buffer.map(x => Number(x)) : buffer;
      result = Function(`"use strict"; return (${unaryFuncText})(arguments[0]);`)(arrayArg);
    } else if (this.opts.m) {// Map stdin to stdout
      const unaryFuncText = this.operands.join('');
      while (yield this.read(this.maxLines, 0, buffer));
      const arrayArg = this.opts.i ? buffer.map(x => Number(x)) : buffer;
      result = (arrayArg as any[]).map(Function(`"use strict"; return (${unaryFuncText})(arguments[0]);`) as any);
    } else if (!this.operands.length) {
      while (yield this.read(this.maxLines, 0, buffer));
      result = Function(`"use strict"; return ${buffer.join('\n')};`)();
    } else {
      result = Function(`"use strict"; return ${this.operands.join(' ')};`)();
    }

    yield this.write(this.transform(result));
  }

  private transform(input: any): string | string[] {
    if (typeof input === 'number' || typeof input === 'boolean') {
      return `${input}`;
    } else if (typeof input === 'string')  {
      return input.replace(/\r+/g, '').split('\n');
    } else if (Array.isArray(input)) {
      return input.flatMap(x => this.transform(x));
    } else {
      return JSON.stringify(input);
    }
  }

}
