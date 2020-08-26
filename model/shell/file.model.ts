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