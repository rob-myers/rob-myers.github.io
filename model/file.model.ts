import { NullINode } from '@store/inode/null.inode';
import { RandomINode } from '@store/inode/random.inode';
import { TtyINode } from '@store/inode/tty.inode';
import { DirectoryINode } from '@store/inode/directory.inode';
import { RegularINode } from '@store/inode/regular.inode';
import { FifoINode } from '@store/inode/fifo.inode';
import { VoiceINode } from '@store/inode/voice.inode';

export type INode = (
  | DirectoryINode
  | FifoINode
  | NullINode
  | RegularINode
  | RandomINode
  | TtyINode
  | VoiceINode
);

/**
 * What a process's file descriptors point to.
 * Directly references the opened IoINode.
 */
export interface OpenFileDescription {
  key: string;
  /**
   * The number of descendent processes using this open file description.
   * - Incremented upon initial open and inheritance.
   * - Decremented on close (explicitly, or via process termination).
   */
  numLinks: number;
  /**
   * The 'opened' i-node.
   */
  iNode: INode;
  /**
   * If iNode is regular, this is the {lineNumber}. (?)
   */
  offset: number;
  /**
   * Read-only, read-and-write, or write-only.
   */
  mode: OpenFileMode;
  /**
   * Applicable if i-node is regular and we may write.
   */
  append: boolean;
}

type OpenFileMode = 'RDONLY' | 'RDWR' | 'WRONLY';

/**
 * Corresponds to arguments of open(1).
 */
export interface OpenFileRequest {
  /**
   * A path to be resolved in context of a process.
   */
  path: string;
  /**
   * Read-only, read-and-write, or write-only.
   */
  mode: OpenFileMode;
  /**
   * Options e.g. can append when writing.
   */
  opts?: OpenFileOpts;
  /**
   * Can optionally specify file descriptor.
   * Default is minimal unused one.
   */
  fd?: number;
}

/**
 * Optionally part of an {OpenFileRequest}.
 */
export interface OpenFileOpts {
  /**
   * Applicable if inode is regular and we may write.
   */
  append?: boolean;
  /**
   * Do not create when path n'exist pas?
   */
  doNotCreate?: boolean;
  /**
   * Truncate file if regular.
   */
  truncateReg?: boolean;
}
