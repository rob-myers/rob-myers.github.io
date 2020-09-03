import { ShellStream } from "@model/shell/shell.stream";

/**
 * - `/dev/null`: two independent streams
 * - `/dev/tty-n`:
 *   - writable respond to writes by printing them
 *   - readable respond to reads by providing user input
 * - `wire`: readable is same as writable
 */
export interface FsFile<R = any, W = any> {
  key: string;
  readable: ShellStream<R>;
  writable: ShellStream<W>;
}


export class OpenFileDescription<T> {
  mode: 'RDWR'; // TODO
  /**
   * The number of descendent processes using this open file description.
   * - incremented upon initial open and inheritance.
   * - decremented on close (explicitly, or via process termination).
   */
  numLinks: number;
  
  constructor(public key: string, public file: FsFile) {
    this.mode = 'RDWR';
    this.numLinks = 0;
  }

  write(msg: T) {
    this.file.writable.write(msg);
  }
}

// type OpenFileMode = 'RDONLY' | 'RDWR' | 'WRONLY';

export function createFsFile<R, W>(
  absPath: string,
  /** We should write to this stream */
  readable: ShellStream<R>,
  /** We should read from this stream */
  writable: ShellStream<W>,
): FsFile {
  return {
    key: absPath,
    readable,
    writable,
  }
}