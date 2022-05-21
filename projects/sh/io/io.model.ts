import { Subject, Subscription } from "rxjs";
import { deepClone } from "model/generic.model";
import type * as Sh from '../parse/parse.model';
import { ProcessMeta, ProcessStatus } from "../session.store";
import { traverseParsed } from '../parse/parse.util';
import { killError } from "../sh.util";
import { removeFirst } from "../../service/generic";

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
  SIGKILL='SIGKILL',
}

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
   * Read data from device
   * - When eof is `true` we may assume no more data
   * - Can specify that exactly one item is read
   * - Can specify if data chunks are forwarded
   */
  readData: (exactlyOne?: boolean, chunks?: boolean) => Promise<ReadResult>;
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

export async function preProcessWrite(
  process: ProcessMeta,
  device: Device,
) {
  if (process.status === ProcessStatus.Killed || device.finishedReading(true)) {
    throw killError(process);
  } else if (process.status === ProcessStatus.Suspended) {
    let cleanup = () => {};
    await new Promise<void>((resolve, reject) => {
      process.onResumes.push(resolve);
      process.cleanups.push(cleanup = () => reject(killError(process)));
    });
    removeFirst(process.cleanups, cleanup);
  }
}

export async function preProcessRead(
  process: ProcessMeta,
  _device: Device,
) {
  if (process.status === ProcessStatus.Killed) {
    throw killError(process);
  } else if (process.status === ProcessStatus.Suspended) {
    let cleanup = () => {};
    await new Promise<void>((resolve, reject) => {
      process.onResumes.push(resolve);
      process.cleanups.push(cleanup = () => reject(killError(process)));
    });
    removeFirst(process.cleanups, cleanup);
  }
}

export function getProcessStatusIcon(status: ProcessStatus) {
  switch(status) {
    case ProcessStatus.Killed: return '💀';
    case ProcessStatus.Running: return '▶️';
    case ProcessStatus.Suspended: return '⏸️';
  }
}

//#region data chunk
export const dataChunkKey = '__chunk__';
export function isDataChunk(data: any): data is DataChunk {
  if (data === undefined || data === null) {
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