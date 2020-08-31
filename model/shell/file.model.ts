import { ShellStream } from "./shell.stream";

export interface OpenFileDescription<R = any, W = any> {
  key: string;
  /**
   * The number of descendent processes using this open file description.
   * - Incremented upon initial open and inheritance.
   * - Decremented on close (explicitly, or via process termination).
   */
  numLinks: number;
  /** The opened stream. */
  stream: ShellStream<R, W>;
  /** Read-only, read-and-write, or write-only. */
  mode: OpenFileMode;
}

type OpenFileMode = 'RDONLY' | 'RDWR' | 'WRONLY';

export function createOfd<R = any, W = any>(
  key: string,
  stream: ShellStream<R, W>,
  // opts: CreateOfdOpts,
): OpenFileDescription<R, W> {
  return {
    key,
    stream,
    /**
     * For the moment, all streams are READ-WRITE,
     * even if they don't provide a writable under-the-hood.
     */
    mode: 'RDWR',
    numLinks: 0, // TODO ?
  };
}
