import { BinaryExecType } from '@model/sh/binary.model';
import { BaseBinaryComposite } from './base-binary';
import { ObservedType } from '@service/term.service';
import { osOpenFileThunk } from '@store/os/file.os.duck';
import { OsDispatchOverload } from '@model/os/os.redux.model';

export class GrepBinary extends BaseBinaryComposite<
  BinaryExecType.grep,
  { boolean: 'E'[]; string: never[] }
> {

  public specOpts() {
    return { boolean: ['E'] as 'E'[], string: [] };
  }

  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {

    const [pattern] = this.operands;
    if (!pattern) {
      yield this.exit();
    }

    const regex = new RegExp(this.opts.E ? pattern : pattern.replace(/\\([?+{|()])/g, '$1'));
    const maxLines = 100;
    const buffer = [] as string[];

    if (this.operands.length === 1) {// Read from stdin.
      while (yield this.read(maxLines, 0, buffer)) {
        yield this.write(buffer.filter((line) => regex.test(line)));
        buffer.length = 0;
      }
    }

    for (const filepath of this.operands.slice(1)) {
      try {
        dispatch(osOpenFileThunk({ processKey, request: { fd: 0, mode: 'RDONLY', path: filepath }}));
      } catch (e) {
        yield this.warn(`${filepath}: no such file or directory`);
        this.exitCode = 1;
        continue;
      }

      while (yield this.read(maxLines, 0, buffer)) {
        const filtered = buffer.filter((line) => regex.test(line));
        if (this.operands.length >= 3) {
          // Multiple filepaths, so need labels.
          yield this.write(filtered.map((x) => `${filepath}:${x}`));
        } else {
          yield this.write(filtered);
        }
        buffer.length = 0;
      }
    }

  }

}
