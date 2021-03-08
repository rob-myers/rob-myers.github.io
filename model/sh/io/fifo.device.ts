import { Device, ReadResult } from "./io.model";

enum FifoStatus {
  Initial,
  Connected,
  Disconnected,
}

const defaultBuffer = 10000;

/**
 * Supports exactly one writer and one reader.
 */
export class FifoDevice implements Device {
  private buffer: any[];
  private readerStatus = FifoStatus.Initial;
  private writerStatus = FifoStatus.Initial;
  /** Invoked to resume pending reader */
  private readerResolver = null as null | (() => void);
  /** Invoked to resume pending writer */
  private writerResolver = null as null | (() => void);

  constructor(
    public key: string,
    public size = defaultBuffer,
  ) {
    this.buffer = [];
  }

  public async readData(): Promise<ReadResult> {
    this.readerStatus = FifoStatus.Connected;
    if (this.buffer.length) {
      this.writerResolver?.(); // Unblock writer
      this.writerResolver = null;
      return { data: this.buffer.shift() };
    } else if (this.writerStatus === FifoStatus.Disconnected) {
      return { eof: true };
    }
    // Reader is blocked
    return new Promise<void>((resolve) => {
      this.readerResolver = resolve;
    }).then(() => this.readData());
  }

  public async writeData(data: any) {
    this.writerStatus = FifoStatus.Connected;
    if (this.readerStatus === FifoStatus.Disconnected) {
      this.buffer.length = 0;
      return;
    }
    this.buffer.push(data);
    this.readerResolver?.(); // Unblock reader
    this.readerResolver = null;
    if (this.buffer.length >= this.size) {
      // Writer is blocked
      return new Promise<void>(resolve => {
        this.writerResolver = resolve;
      });
    }
  }

  public finishedReading() {
    this.readerStatus = FifoStatus.Disconnected;
    this.writerResolver?.();
    this.writerResolver = null;
  }

  public finishedWriting() {
    this.writerStatus = FifoStatus.Disconnected;
    this.readerResolver?.();
    this.readerResolver = null;
  }

  public readAll() {
    const contents = [] as any[];
    this.buffer.forEach(x => {
      if (isDataChunk(x)) {
        x.items.forEach(y => contents.push(y));
      } else {
        contents.push(x);
      }
    });
    this.buffer.length = 0;
    return contents;
  }
}

//#region chunks of data
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
