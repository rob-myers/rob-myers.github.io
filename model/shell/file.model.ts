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

export interface OpenFileDescription<T> {
  key: string;
  /**
   * The number of descendent processes using this open file description.
   * - incremented upon initial open and inheritance.
   * - decremented on close (explicitly, or via process termination).
   */
  numLinks: number;
  /** The opened file. */
  file: FsFile;
  /** Read only, read and write, or write only. */
  mode: OpenFileMode;
}

type OpenFileMode = 'RDONLY' | 'RDWR' | 'WRONLY';

export function createOfd<T>(
  key: string,
  file: FsFile,
): OpenFileDescription<T> {
  return {
    key,
    file,
    mode: 'RDWR', // TODO
    numLinks: 0, // TODO
  };
}

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