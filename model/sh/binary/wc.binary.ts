import { BinaryExecType } from '@model/sh/binary.model';
import { BaseBinaryComposite } from './base-binary';
import { ObservedType } from '@service/term.service';
import { OsDispatchOverload } from '@model/os/os.redux.model';
import { osOpenFileThunk } from '@store/os/file.os.duck';

export class WcBinary extends BaseBinaryComposite<
  BinaryExecType.wc,
  { string: never[]; boolean: 'l'[] }
> {

  public specOpts() {
    return { string: [], boolean: ['l'] as 'l'[] };
  }

  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    const maxLines = 100;
    const buffer = [] as string[];
    
    if (!this.operands.length) {// Read from stdin.
      while (yield this.read(maxLines, 0, buffer)) {
        /**
         * TODO Seems to terminate immediately when reading from piped one-line file?
         */
      }
      const count = this.opts.l ? buffer.length : buffer.join('\n').length;
      yield this.write(`${count}`);
    }

    for (const filepath of this.operands) {
      try {
        dispatch(osOpenFileThunk({ processKey, request: { fd: 0, mode: 'RDONLY', path: filepath } }));
      } catch (e) {
        yield this.warn(`${filepath}: no such file or directory`);
        this.exitCode = 1;
        continue;
      }

      while (yield this.read(maxLines, 0, buffer));
      const count = this.opts.l ? buffer.length : buffer.join('\n').length;
      yield this.write(`${filepath}: ${count}`);
    }

  }

}
