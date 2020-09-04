import { ShellStream } from "@model/shell/shell.stream";

/**
 * - `/dev/null`: two independent streams
 * - `/dev/tty-n`:
 *   - writable respond to writes by printing them
 *   - readable respond to reads by providing user input
 * - `wire`: readable is same as writable
 */
export class FsFile<R = any, W = any> {
  constructor(
    /** Absolute path. */
    public key: string,
    public iNode: ShellFile<R, W>,
  ) {}

  /** Write to readers of this file */
  internalWrite(msg: R) {
    this.iNode.readable.write(msg);
  }

  /** Register a callback to handle writes to this file */
  internalWriteHandler(cb: (msg: W) => void) {
    this.iNode.writable.registerCallback(cb); 
  }

  /** Read from this file */
  read(cb: (msg: R) => void) {
    this.iNode.readable.registerCallback(cb);
  }

  /** Write to this file */
  write(msg: W) {
    this.iNode.writable.write(msg);
  }
}

export class ShellFile<R, W> {
 /**
  * The number of places this file has been mounted,
  * i.e. number of keys in `ShellState['fs']` with value `this`.
  */
  public numLinks: number;

  constructor(
    /** Readers will read from this stream */
    public readable: ShellStream<R>,
    /** Writers will write to this stream */
    public writable: ShellStream<W>,
  ) {
    this.numLinks = 0;
  }
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
    this.file.write(msg);
  }
}

type OpenFileMode = 'RDONLY' | 'RDWR' | 'WRONLY';

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
   * Read only, read n'write, or write only.
   */
  mode: OpenFileMode;
  /**
   * Can optionally specify file descriptor.
   * Default is minimal unused one.
   */
  fd?: number;
}
