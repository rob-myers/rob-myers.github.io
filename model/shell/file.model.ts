import { Subject } from "rxjs";

export interface OpenFileDescription {
  key: string;
  /**
   * The number of descendent processes using this open file description.
   * - Incremented upon initial open and inheritance.
   * - Decremented on close (explicitly, or via process termination).
   */
  numLinks: number;
  /**
   * The opened stream.
   */
  stream: Subject<any>;
  /**
   * Read-only, read-and-write, or write-only.
   */
  mode: OpenFileMode;
}

type OpenFileMode = 'RDONLY' | 'RDWR' | 'WRONLY';

export interface CreateOfdOpts {
  /**
   * Read-only, read-and-write, or write-only.
   */
  mode: OpenFileMode;
}
