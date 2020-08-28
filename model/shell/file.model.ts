import { DirectoryINode } from "@model/inode/directory.inode";
import { FifoINode } from "@model/inode/fifo.inode";
import { HistoryINode } from "@model/inode/history.inode";
import { NullINode } from "@model/inode/null.inode";
import { RegularINode } from "@model/inode/regular.inode";
import { RandomINode } from "@model/inode/random.inode";
import { TtyINode } from "@model/inode/tty.inode";
import { VoiceINode } from "@model/inode/voice.inode";

export type INode = (
  | DirectoryINode
  | FifoINode
  | HistoryINode
  | NullINode
  | RegularINode
  | RandomINode
  | TtyINode
  | VoiceINode
);

export interface OpenFileDescription {
  key: string;
  /**
   * The number of descendent processes using this open file description.
   * - Incremented upon initial open and inheritance.
   * - Decremented on close (explicitly, or via process termination).
   */
  numLinks: number;
  /**
   * The opened iNode.
   */
  iNode: INode;
  /**
   * If iNode is regular this is the lineNumber.
   */
  offset: number;
  /**
   * Read-only, read-and-write, or write-only.
   */
  mode: OpenFileMode;
  /**
   * Applicable if iNode is regular and we may write.
   */
  append: boolean;
}

type OpenFileMode = 'RDONLY' | 'RDWR' | 'WRONLY';

export interface CreateOfdOpts {
  /**
   * Read-only, read-and-write, or write-only.
   */
  mode: OpenFileMode;
  /**
   * Applicable if inode is regular and we may write.
   */
  append?: boolean;
}