import { Subject, Subscription } from "rxjs";

export class ShellStream<T> {

  public subscription: null | Subscription;
  private internal: Subject<T>;
  private cbToSub: Map<(msg: T) => void, Subscription>;
  private once: Set<(msg: T) => void>;

  constructor() {
    this.internal = new Subject;
    this.subscription = this.internal.subscribe();
    this.cbToSub = new Map;
    this.once = new Set;
  }

  /** For receiving multicast */
  registerCallback(cb: (msg: T) => void, once: boolean) {
    this.cbToSub.set(cb, this.internal.subscribe(cb));
    once && this.once.add(cb);
  }

  unregisterCallback(cb: (msg: T) => void) {
    this.cbToSub.get(cb)?.unsubscribe();
    this.cbToSub.delete(cb);
    this.once.delete(cb);
  }
  
  write(msg: T) {
    this.internal.next(msg);
    for (const cb of this.once) {
      this.cbToSub.get(cb)!.unsubscribe();
    }
    this.once.clear();
  }

}
