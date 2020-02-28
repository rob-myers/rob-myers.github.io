import { basename } from '@service/path';
import { BinaryExecType } from '@model/sh/binary.model';
import { BaseBinaryComposite } from './base-binary';
import { ObservedType } from '@service/term.service';
import { OsDispatchOverload } from '@model/os/os.redux.model';
import { osOpenFileThunk } from '@store/os/file.os.duck';

export class HeadBinary extends BaseBinaryComposite<
  BinaryExecType.head,
  { string: 'n'[]; boolean: never[] }
> {

  public specOpts() {
    return { string: ['n'] as 'n'[], boolean: [] };
  }

  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    if (this.opts.n) {
      if (!this.opts.n.trim()) {
        yield this.exit(1, 'option requires an argument -- \'n\'');
      } else if (this.opts.n !== `${parseInt(this.opts.n)}` || parseInt(this.opts.n) < 0) {
        // We do not support `head -n -10` i.e. all but last 10 lines.
        yield this.exit(1, `invalid number of lines: '${this.opts.n}'`);
      }
    }
    const numLines = this.opts.n ? parseInt(this.opts.n) : 10;
    const buffer = [] as string[];

    if (!this.operands.length) {// Read from stdin.
      while ((yield this.read(numLines, 0, buffer)) && buffer.length < numLines);
      yield this.write(buffer);
    }

    for (const [index, filepath] of this.operands.entries()) {
      try {
        dispatch(osOpenFileThunk({ processKey, request: { fd: 0, mode: 'RDONLY', path: filepath } }));
      } catch (e) {
        continue;
      }

      if (this.operands.length > 1) {// Write header.
        if (index > 0) {
          yield this.write();
        }
        yield this.write(`==> ${basename(filepath)} <==`);
      }

      buffer.length = 0;
      while ((yield this.read(numLines, 0, buffer)) && buffer.length < numLines);
      yield this.write(buffer);
    }
  }

}
