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
  /**
   * The number of descendent processes using this open file description.
   * - incremented upon initial open and inheritance.
   * - decremented on close (explicitly, or via process termination).
   */
  numLinks: number;
  
  constructor(
    public key: string,
    public file: FsFile,
    public mode: OpenFileMode,
  ) {
    this.numLinks = 0;
  }

  write(msg: T) {
    this.file.writable.write(msg);
  }
}

type OpenFileMode = 'RDONLY' | 'RDWR' | 'WRONLY';

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

export type RedirectDef<WordType> = (
  | { subKey: '<'; fd?: number; mod: null | 'dup' | 'move' }
  /**
   * Output modifier:
   * - `null` (fd>location): Open {location} at {fd} (default 1) for writing.
   * - `append` (fd>>location): Open {location} at {fd} (default 1) for appending at location.
   * - `dup`: (fd>&location): Duplicate file descriptor {location} at {fd} (default 1).
   *   {location} must be a valid fd which writes output, or '-' (close fd).
   *   TODO: special case where {location} evaluates to whitespace.
   * - `move` (<&-): Move file descriptor {location} to {fd} (default 1).
   *   {location} must be a valid fd which writes output.
   */
  | { subKey: '>'; fd?: number; mod: null | 'append' | 'dup' | 'move' }
  // Open stdout and stderr for writing, possibly appending.
  | { subKey: '&>'; append: boolean }
  // Here-doc at fd (default 0).
  | { subKey: '<<'; fd?: number; here: WordType }
  // Here-string `location` at fd (default 0).
  | { subKey: '<<<'; fd?: number }
  // Open fd (default 0) for reading and writing.
  | { subKey: '<>'; fd?: number }
);

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
   * Can optionally specify file descriptor.
   * Default is minimal unused one.
   */
  fd?: number;
}