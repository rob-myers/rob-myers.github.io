import { basename } from 'path';
import { BinaryExecType } from '@model/sh/binary.model';
import { defaultMaxLines } from '@model/os/file.model';
import { isStringInt } from '@model/generic.model';
import { OsDispatchOverload } from '@model/os/os.redux.model';
import { osResolvePathThunk, osOpenFileThunk, osOffsetOpenAct, osGetOfdThunk } from '@store/os/file.os.duck';
import { INodeType } from '@store/inode/base-inode';
import { RegularINode } from '@store/inode/regular.inode';
import { ObservedType } from '@os-service/term.service';
import { BaseBinaryComposite } from './base-binary';

/**
 * tail
 */
export class TailBinary extends BaseBinaryComposite<
  BinaryExecType.tail,
  { string: 'n'[]; boolean: never[] }
> {

  public specOpts() {
    return { string: ['n' as 'n'], boolean: [] };
  }

  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    if (this.opts.n) {
      if (!isStringInt(this.opts.n) || parseInt(this.opts.n) < 0) {
        yield this.exit(1, `invalid number of lines: '${this.opts.n}'`);
      }
    }
    const numLines = this.opts.n ? parseInt(this.opts.n) : 10;

    if (!this.operands.length) {// Read from stdin.
      yield* this.tailStream(numLines);
      return;
    }

    // Otherwise try to resolve each operand.
    for (const [index, filepath] of this.operands.entries()) {
      try {
        const { iNode } = dispatch(osResolvePathThunk({ processKey, path: filepath }));
        if (iNode.type === INodeType.directory) {
          continue; // Skip directories.
        }
        /**
         * Write header when multiple files.
         */
        if (this.operands.length > 1) {
          if (index > 0) {
            yield this.write();
          }
          yield this.write(`==> ${basename(filepath)}`);
        }
        /**
         * Open file at stdin.
         */
        dispatch(osOpenFileThunk({ processKey, request: { fd: 0, mode: 'RDONLY', path: filepath } }));

        if (iNode.type === INodeType.regular) {
          yield* this.tailRegular(numLines, dispatch, processKey);
        } else {
          yield* this.tailStream(numLines);
        }
      } catch (e) {
        continue;
      }
    }
  }

  private async *tailStream(numLines: number): AsyncIterableIterator<ObservedType> {
    const maxLines = defaultMaxLines;
    let buffer = [] as string[];

    while (yield this.read(maxLines, 0, buffer)) {
      if (buffer.length > numLines) {
        // Only need to remember last {numLines}.
        buffer = buffer.slice(-numLines);
      }
    }
    yield this.write(buffer);
  }

  private async *tailRegular(numLines: number, dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    /**
     * Move open-file offset to {data.length - numLines}.
     */
    const { key: openKey, offset, iNode } =  dispatch(osGetOfdThunk({ processKey, fd: 0 }));
    const delta = -offset + ((iNode as RegularINode).data.length - numLines);
    dispatch(osOffsetOpenAct({ openKey, delta }));

    while (yield this.read(10, 0)) {
      yield this.write();
    }
  }

}
