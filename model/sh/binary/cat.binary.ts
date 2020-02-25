import { BinaryExecType } from '@model/sh/binary.model';
import { BaseBinaryComposite } from './base-binary';
import { ObservedType } from '@service/term.service';
import { OsDispatchOverload } from '@model/redux.model';
import { osOpenFileThunk } from '@store/os/file.os.duck';

export class CatBinary extends BaseBinaryComposite<BinaryExecType.cat> {

  private readonly maxIterations = 5000;

  public specOpts() {
    return { string: [], boolean: [] };
  }

  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    const maxLines = 100;

    if (!this.operands.length) {// Read from stdin.
      while (yield this.read(maxLines)) {
        yield this.write();
      }
    }

    for (const filepath of this.operands) {
      try {
        dispatch(osOpenFileThunk({ processKey, request: { fd: 0, mode: 'RDONLY', path: filepath } }));
      } catch (e) {
        yield this.warn(`${filepath}: no such file or directory`);
        this.exitCode = 1;
        continue;
      }

      /**
       * Basic protection against {cat foo >> foo}.
       * Would be better to slow it down gracefully,
       * permitting Ctrl + C.
       */
      let numIterations = 0;

      while (yield this.read(maxLines)) {
        yield this.write();
        if (numIterations++ > this.maxIterations) {
          yield this.exit(1, 'max iterations exceeded');
          break;
        }
      }
    }
  }

}
