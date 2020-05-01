import generateUid from 'shortid';
import { DirectoryINode } from '@store/inode/directory.inode';
import { INode, OpenFileDescription, OpenFileRequest } from '@model/os/file.model';
import { INodeType } from '@store/inode/base-inode';
import { keys, last } from '@model/generic.model';
import { State } from '@store/os/os.duck';
import { FromFdToOpenKey, ProcessState } from '@model/os/process.model';
import { removeFromLookup, updateLookup } from '@model/redux.model';
import { RegularINode } from '@store/inode/regular.inode';
import { GetOpts } from '@model/os/os.model';
import { TermError } from './term.util';
import { FifoINode } from '@store/inode/fifo.inode';

export class FilesystemService {

  /**
   * Convert path to absolute path by:
   * - rewriting ~ to ${HOME}.
   * - rewriting ./ to ${cwd}/.
   * - if no prefix / then add prefix ${cwd}/.
   *
   * We do not resolve inner .'s or ..'s.
   */
  public absPath(
    path: string,
    { homeDir, cwd }: {
      /** Absolute path to user's home directory. */
      homeDir: string;
      /** Absolute path to process's current working directory. */
      cwd: string;
    },
  ) {
    if (path.startsWith('/')) {
      return path;
    } else if (path.startsWith('~')) {
      // Leading ~ to user's home directory.
      return `${homeDir}${path.slice(1)}`;
    } else if (path.startsWith('./')) {
      // Leading ./ to process's current working directory.
      return `${cwd}${path.slice(1)}`;
    }// Non-leading / to process's current working directory.
    return `${cwd}/${path}`;
  }

  /**
   * Given absolute path {absPath} try to resolve {INode},
   * throwing an error if not found.
   */
  public absPathToINode(absPath: string, root: DirectoryINode) {
    const [,...parts] = absPath.split('/');
    const lastPart = parts.pop();
    let iNode = root as INode;// Root directory.
    for (const part of parts) {
      if (iNode.type === INodeType.directory) {
        iNode = iNode.to[part];
      } else {
        throw new TermError(`${part}: not a directory`, 1, 'NOT_A_DIR');
      }
    }
    if (lastPart) {
      if (iNode.type !== INodeType.directory) {
        // Penultimate not a directory.
        throw new TermError(`${last(parts)}: no such file or directory`, 1, 'F_NO_EXIST');
      } else if (!iNode.to[lastPart]) {
        throw new TermError(`${lastPart}: no such file or directory`, 1, 'F_NO_EXIST');
      }
      return iNode.to[lastPart];
    }
    return iNode;
  }

  /**
   * Create open file description.
   */
  public createOfd(iNode: INode, request: OpenFileRequest): OpenFileDescription {
    const openKey = `${generateUid()}.ofd`;

    // Only regular files can be appended to.
    const append = iNode.type === INodeType.regular
      && request.opts && request.opts.append || false;

    const ofd: OpenFileDescription = {
      key: openKey, // Global key as opposed to per-process fd.
      iNode,// Direct reference.
      append,
      mode: request.mode,
      // When appending we'll offset before each write.
      offset: append ? (iNode as RegularINode).data.length : 0,
      numLinks: 0,
    };

    return ofd;
  }

  /**
   * If fd unspecified, use minimal unassigned.
   */
  public getNextFd(
    fdToOpenKey: ProcessState['fdToOpenKey'],
    requestedFd: number | undefined,
  ): number {
    return requestedFd === undefined
      ? firstAvailableInteger(Object.keys(fdToOpenKey).map(Number))
      : requestedFd;
  }

  public realPath(
    path: string,
    root: DirectoryINode,
    { homeDir, cwd }: { homeDir: string; cwd: string },
  ) {
    if (!path.trim()) {// Only whitespace.
      throw new TermError(`${path}: no such file or directory`, 1, 'F_NO_EXIST');
    }
    const absPath = this.absPath(path, { homeDir, cwd });

    const [,...parts] = absPath.split('/');
    const lastPart = parts.pop();
    const absParts = [] as string[];
    let iNode = root as INode;
    for (const part of parts) {
      if (!part || part === '.') {
        continue;// ignore repeated /'s or self-loops
      }
      if (iNode.type === INodeType.directory) {
        iNode = iNode.to[part];
        if (!iNode) {
          throw new TermError(`${path}: no such file or directory`, 1, 'F_NO_EXIST');
        } else if (part === '..') {
          absParts.pop();
        } else {
          absParts.push(part);
        }
      } else {
        throw new TermError(`${path}: no such file or directory`, 1, 'F_NO_EXIST');
      }
    }

    if (!lastPart || lastPart === '.') {
      // Can omit last part.
    } else if (lastPart === '..') {
      absParts.pop(); // One-level up.
    } else {// Note that file {lastPart} needn't exist!
      absParts.push(lastPart);
    }
    return `/${absParts.join('/')}`;
  }

}

/**
 * Decrements {numLinks} in open file descriptions.
 * Also removes them when {numLinks} will be zero.
 */
export function closeFd({ fromFd, fd, ofd, warnNonExist = false }: {
  fromFd: FromFdToOpenKey;
  /** File descriptor. */
  fd: number;
  /** Current open file description state. */
  ofd: State['ofd'];
  /** Warn if open file description non-existent? */
  warnNonExist?: boolean;
}): State['ofd'] {

  const openKey = fromFd[fd];
  const open = ofd[openKey];

  if (openKey && open) {
    if (open.numLinks > 1) {
      return updateLookup(openKey, ofd, ({ numLinks }) => ({
        numLinks: numLinks - 1
      }));
    }
    /**
     * Otherwise will have zero {numLinks}, so remove.
     * Fifos need additional work.
     */
    if (open.iNode.type === INodeType.fifo) {
      if (open.mode === 'WRONLY' || open.mode === 'RDWR') {
        setTimeout(() => (open.iNode as FifoINode).removeWriter(openKey));
      }
      if (open.mode === 'RDONLY' || open.mode === 'RDWR') {
        setTimeout(() => (open.iNode as FifoINode).awakenWriters());
      }
    }
    return removeFromLookup(openKey, ofd);
  }
  if (warnNonExist) {// For debugging.
    console.error(`Cannot open non-existent '${openKey}' at ${fd}`);
  }
  return { ...ofd };
}

/**
 * First available non-negative integer given a
 * pre-existing list of non-negative integers.
 */
export function firstAvailableInteger(nonNegativeInts: number[]) {
  if (nonNegativeInts.length) {
    const extended = nonNegativeInts.concat(NaN);
    return extended.findIndex((_, i) => !extended.includes(i));
  }
  return 0;
}

/**
 * getopts (npm module) produces an array if an option appears multiple times.
 * We replace each array with its last element.
 */
export function simplifyGetOpts<StringOpts extends string, BooleanOpts extends string>(
  parsed: GetOpts<StringOpts, BooleanOpts>
): void {
  keys(parsed).forEach((key) => {
    if (key !== '_' && Array.isArray(parsed[key])) {
      parsed[key] = last(parsed[key]) as any;
    }
  });
}