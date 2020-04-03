import cliColumns from 'cli-columns';
import { BinaryExecType } from '@model/sh/binary.model';
import { BaseBinaryComposite } from './base-binary';
import { ObservedType } from '@os-service/term.service';
import { OsDispatchOverload } from '@model/os/os.redux.model';
import { osGetOfdThunk, osResolvePathThunk } from '@store/os/file.os.duck';
import { INodeType } from '@store/inode/base-inode';

export class LsBinary extends BaseBinaryComposite<BinaryExecType.ls, { boolean: ('1' | 'a' | 'l')[]; string: never[] }> {

  public specOpts() {
    return { boolean: ['1', 'a', 'l'] as ('1' | 'a' | 'l')[], string: [] };
  }

  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    
    if (this.unknownOpts.length) {
      yield this.exit(1, `illegal option -- ${this.unknownOpts[0]}`);
    }

    // If writing to a tty we could use its column width.
    const { iNode } = dispatch(osGetOfdThunk({ processKey, fd: 1 }));
    const columnWidth = (iNode.type === INodeType.tty) && iNode.cols || undefined;
    const onePerLine = this.opts[1] || this.opts.l;
    const filepaths = this.operands.length ? this.operands : ['.'];
    /**
     * Files are printed first, regardless of original order,
     * so we buffer all output before writing.
     */
    const filesBuffer = [] as string[];
    const dirsBuffer = [] as string[][];

    for (const filepath of filepaths) {
      try {
        const { iNode } = dispatch(osResolvePathThunk({ processKey, path: filepath }));
        if (iNode.type === INodeType.directory) {
          // List filenames
          let filenames = this.opts.a
            ? ['.', '..'].concat(Object.keys(iNode.to))
            : Object.keys(iNode.to).filter((x) => !x.startsWith('.'));
 
          if (filenames.length) {
            if (!onePerLine && columnWidth) {// Compute nice layout.
              filenames = cliColumns(filenames, { width: columnWidth }).split('\n');
            }
            if (filepaths.length > 1) {
              filenames = [`${filepath}:`, ...filenames];
            }
            // yield this.write(filenames);
            dirsBuffer.push(filenames);
          }
        } else { // Just echo filepath
          filesBuffer.push(filepath);
        }
      } catch (e) {
        yield this.warn(`${filepath}: no such file or directory`);
        this.exitCode = 1;
      }
    }

    /**
     * Write the file listings.
     */
    if (filesBuffer.length && dirsBuffer.length) {
      filesBuffer.push('');
    }

    yield this.write(filesBuffer);

    for (const [index, dirLines] of dirsBuffer.entries()) {
      if (index > 0) {
        yield this.write('');
      }
      yield this.write(dirLines);
    }

  }

}
