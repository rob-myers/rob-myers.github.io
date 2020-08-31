import { Subject, Subscription } from "rxjs";

export class ShellStream<R, W> {

  public readers: Subject<R>[];
  public subscription: null | Subscription;

  constructor(public def: Opts<R, W>) {
    this.readers = [];
    this.subscription = def.readable?.subscribe(
      this.onMessage.bind(this)
    ) || null;
  }

  registerReader(reader: Subject<R>) {
    // Most recent registration takes priority
    this.readers.unshift(reader);
  }
  
  unregisterReader(reader: Subject<R>) {
    this.readers = this.readers.filter(x => x !== reader);
  }

  write(msg: W) {
    // This will error if no writable
    this.def.writable!.next(msg);
  }

  private onMessage(msg: R) {
    if (this.readers.length) {
      this.readers[0].next(msg);
    }
  }

}

interface Opts<R, W> {
  /** Stream than can be read from */
  readable?: Subject<R>;
  /** Stream that can be written to */
  writable?: Subject<W>;
}
