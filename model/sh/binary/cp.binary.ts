import { BinaryExecType } from '@model/sh/binary.model';
import { BaseBinaryComposite } from './base-binary';
import { ObservedType } from '@service/term.service';
import { OsDispatchOverload } from '@model/os.redux.model';
import { osRealPathThunk, osAbsToINodeThunk, osMountFileAct, osUnlinkFileThunk, osResolvePathThunk } from '@store/os/file.os.duck';
import { INodeType } from '@store/inode/base-inode';
import { DirectoryINode } from '@store/inode/directory.inode';
import { basename, dirname } from 'path';
import { INode } from '@model/file.model';

/**
 * cp or mv.
 * Copy file(s), or Move file(s).
 * cp {src_1} ... {src_n} {dst}
 * mv {src_1} ... {src_n} {dst}
 */
export class CpOrMvBinary<T extends BinaryExecType.cp | BinaryExecType.mv> extends BaseBinaryComposite<T> {

  public specOpts() {
    return { string: [], boolean: [] };
  }

  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {

    if (!this.operands.length) {
      yield this.exit(1, 'missing file operand');
    } else if (this.operands.length === 1) {
      yield this.exit(1, `missing destination file operand after '${this.operands[0]}'`);
    }
    const srcArgs = this.operands.slice();
    const dstArg = srcArgs.pop() as string;
    let dstINode: INode | undefined = undefined;

    try {
      const dstPath = dispatch(osRealPathThunk({ processKey, path: dstArg }));
      try {
        dstINode = dispatch(osAbsToINodeThunk({ absPath: dstPath }));
      } catch (e) {
        // NOOP
      }

      if (srcArgs.length > 1 && dstINode && dstINode.type !== INodeType.directory) {
        yield this.exit(1, `target '${dstArg}' is not a directory`);
      }

      for (const srcArg of srcArgs) {
        try {
          const src = dispatch(osResolvePathThunk({ processKey, path: srcArg }));

          if (src.absPath === dstPath) {// Nothing to move.
            continue;
          } else if (dstINode && dstINode.type === INodeType.directory) {
            /**
             * Copy into {dst} using filename of {src}.
             */
            dispatch(osMountFileAct({ parent: dstINode, filename: basename(src.absPath), iNode: src.iNode }));
          } else {
            /**
             * Overwrite {dst}.
             */
            const parent = dispatch(osAbsToINodeThunk({ absPath: dirname(dstPath) })) as DirectoryINode;
            dispatch(osMountFileAct({ parent, filename: basename(dstPath), iNode: src.iNode }));
          }
          if (this.binaryKey === BinaryExecType.mv) {
            /**
             * Command {mv} additionally removes {src}.
             */
            dispatch(osUnlinkFileThunk({ processKey, path: src.absPath }));
          }
        } catch (e) {
          yield this.warn(`cannot stat '${srcArg}': no such file or directory`);
          continue;
        }

      }
    } catch (e) {
      yield this.exit(1, `cannot stat '${dstArg}': no such file or directory`);
    }

  }

}

export class CpBinary extends CpOrMvBinary<BinaryExecType.cp> {}
