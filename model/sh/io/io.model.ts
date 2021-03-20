import { Subject, Subscription } from "rxjs";
import type * as Sh from '../parse/parse.model';
import useSession, { ProcessStatus } from "store/session.store";
import { traverseParsed } from '../parse/parse.util';
import { ProcessError } from "../sh.util";
import { deepClone } from "model/generic.model";

export const scrollback = 200;

export function makeShellIo<R, W>() {
  return new ShellIo(new ShellWire<R>(), new ShellWire<W>());
}

/**
 * Two ShellSubjects i.e. the man in the middle.
 * Currently only used for TTY.
 */
export class ShellIo<R, W> {

  constructor(
    /** Readers will read from here */
    public readable: ShellWire<R>,
    /** Writers will write to here */
    public writable: ShellWire<W>,
  ) {}

  /** Register a callback to handle writes to this file */
  handleWriters(cb: (msg: W) => void) {
    this.writable.registerCallback(cb); 
    return () => this.writable.unregisterCallback(cb);
  }

  /** Read from this file */
  read(cb: (msg: R) => void) {
    this.readable.registerCallback(cb);
    return () => this.readable.unregisterCallback(cb);
  }

  /** Write to this file */
  write(msg: W) {
    this.writable.write(msg);
  }

  /** Write to readers of this file */
  writeToReaders(msg: R) {
    this.readable.write(msg);
  }
}

/** A wire with two ends */
class ShellWire<T> {

  private internal: Subject<T>;
  private cbToSub: Map<(msg: T) => void, Subscription>;

  constructor() {
    this.internal = new Subject;
    this.internal.subscribe();
    this.cbToSub = new Map;
  }

  registerCallback(cb: (msg: T) => void) {
    this.cbToSub.set(cb, this.internal.subscribe(cb));
  }

  unregisterCallback(cb: (msg: T) => void) {
    this.cbToSub.get(cb)?.unsubscribe();
    this.cbToSub.delete(cb);
  }
  
  write(msg: T) {
    this.internal.next(msg);
  }
}

export enum SigEnum {
  SIGHUP='SIGHUP',
  SIGINT='SIGINT',
  SIGQUIT='SIGQUIT',
  SIGKILL='SIGKILL',
}

export type RedirectDef = (
  | { subKey: '<'; fd?: number; mod: null | 'dup' | 'move' }
  /**
   * Output modifier:
   * - `null` (fd>location): Open `location` at `fd` (default 1) for writing.
   * - `append` (fd>>location): Open `location` at `fd` (default 1) for appending at location.
   * - `dup`: (fd>&location): Duplicate file descriptor `location` at `fd` (default 1).
   *   `location` must be a valid fd which writes output, or '-' (close fd).
   *   TODO: special case where `location` evaluates to whitespace.
   * - `move` (<&-): Move file descriptor `location` to `fd` (default 1).
   *   `location` must be a valid fd which writes output.
   */
  | { subKey: '>'; fd?: number; mod: null | 'append' | 'dup' | 'move' }
  // Open stdout and stderr for writing, possibly appending.
  | { subKey: '&>'; append: boolean }
  // Here-doc at fd (default 0).
  // | { subKey: '<<'; fd?: number; here: WordType }
  // Here-string `location` at fd (default 0).
  | { subKey: '<<<'; fd?: number }
  // Open fd (default 0) for reading and writing.
  | { subKey: '<>'; fd?: number }
);

/**
 * Redirect a node and its descendents e.g.
 * - `echo foo; echo bar >/dev/null; echo baz`.
 * - `echo foo; { echo bar; } >/dev/null; echo baz`.
 */
export function redirectNode(
  node: Sh.ParsedSh,
  fdUpdates: Record<number, string>,
) {
  const newMeta = deepClone(node.meta);
  Object.assign(newMeta.fd, fdUpdates);
  traverseParsed(node, (descendent) => descendent.meta = newMeta);
}

export interface Device {
  /** Uid used to 'resolve' device */
  key: string;
  /**
   * Read data from device.
   * When eof is `true` we may assume no more data.
   * Can specify that exactly one item is read.
   */
  readData: (exactlyOne?: boolean) => Promise<ReadResult>;
  /** Write data to device. */
  writeData: (data: any) => Promise<void>;
  /** Query/inform device we have finished all writes. */
  finishedWriting: (query?: boolean) => void | undefined | boolean;
  /** Query/Inform device we have finished all reads. */
  finishedReading: (query?: boolean) => void | undefined | boolean;
}

export interface ReadResult {
  eof?: boolean;
  data?: any;
}

/** Suspend/prevent reads/writes for relevant process status. */
export function withProcessHandling(
  device: Device,
  meta: Sh.BaseMeta,
): Device {
  const process = useSession.api.getProcess(meta.pid, meta.sessionKey);

  // TODO use OpenFileDescription
  console.log('created proxy', device);

  return new Proxy(device, {
    get: (target, p: keyof Device) => {
      if (p === 'writeData' || p === 'readData') {
        if (
          process.status === ProcessStatus.Killed
          // || (p === 'writeData' && device.finishedReading(true))
          // || (p === 'readData' && device.finishedWriting(true))
        ) {
          throw new ProcessError(SigEnum.SIGKILL, meta.pid, meta.sessionKey);
        } else if (process.status === ProcessStatus.Suspended) {
          return async (input?: any) => {
            await new Promise<void>(resolve => process.onResume = resolve);
            await target[p](input);
          };
        }
      }
      return target[p];
    }
  });
}

export function getProcessStatusIcon(status: ProcessStatus) {
  switch(status) {
    case ProcessStatus.Killed: return '☠';
    case ProcessStatus.Running: return '▶️';
    case ProcessStatus.Suspended: return '⏸️';
  }
}

//#region data chunk
export const dataChunkKey = '__chunk__';
export function isDataChunk(data: any): data is DataChunk {
  if (data === undefined) {
    return false;
  }
  return data[dataChunkKey];
}
export function dataChunk(items: any[]): DataChunk {
  return { __chunk__: true, items };
}

export interface DataChunk {
  [dataChunkKey]: true;
  items: any[];
}
//#endregion