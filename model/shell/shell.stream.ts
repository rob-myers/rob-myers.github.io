import { Subject, Subscription } from "rxjs";

export class ShellStream<T> {

  public readers: Subject<T>[];
  public subscription: null | Subscription;
  private internal: Subject<T>;
  private cbToSub: Map<(msg: T) => void, Subscription>;

  constructor() {
    this.readers = [];
    this.internal = new Subject;
    this.subscription = this.internal.subscribe(
      this.onMessage.bind(this)
    ) || null;
    this.cbToSub = new Map;
  }

  /** For receiving multicast */
  registerCallback(cb: (msg: T) => void) {
    this.cbToSub.set(cb, this.internal.subscribe(cb));
  }

  // /** For blocking read */
  // registerReader(reader: Subject<T>) {
  //   // Most recent registration takes priority
  //   this.readers.unshift(reader);
  // }

  unregisterCallback(cb: (msg: T) => void) {
    this.cbToSub.get(cb)?.unsubscribe();
    this.cbToSub.delete(cb);
  }
  
  // unregisterReader(reader: Subject<T>) {
  //   this.readers = this.readers.filter(x => x !== reader);
  // }

  write(msg: T) {
    this.internal.next(msg);
  }

  private onMessage(msg: T) {
    if (this.readers.length) {
      this.readers[0].next(msg);
    }
  }

}
