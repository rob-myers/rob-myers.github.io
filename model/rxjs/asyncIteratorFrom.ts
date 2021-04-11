/** https://github.com/ReactiveX/rxjs/blob/3f3c614d8b86c68d271a1db995ff11c61842e757/src/internal/asyncIteratorFrom.ts#L4 */
import { Observable } from "rxjs";
import { Deferred } from "./deferred";

export function asyncIteratorFrom<T>(source: Observable<T>, config: CoroutineConfig<T>) {
  config.forget = () => (config.enabled = false);
  config.remember = () => (config.enabled = true);
  config.enabled = true;
  return coroutine(source, config);
}

async function* coroutine<T>(source: Observable<T>, config: CoroutineConfig<T>) {
  let deferred = null as null | Deferred<IteratorResult<T>>;
  let error: any = null;
  let [hasError, completed] = [false, false];
  const values: T[] = [];

  config.forget = () => {
    config.enabled = false; // Ignore incoming
    values.length = 0; // Forget pending
  };

  const subs = source.subscribe({
    next: value => {
      if (!config.enabled) {
        return;
      } else if (deferred) {
        deferred.resolve({ value, done: false });
      } else {
        values.push(value);
      }
    },
    error: err => {
      hasError = true;
      error = err;
      deferred?.reject(err);
    },
    complete: () => {
      completed = true;
      deferred?.resolve({ value: undefined, done: true });
    },
  });

  try {
    while (true) {
      if (values.length > 0) {
        yield values.shift();
      } else if (completed) {
        return;
      } else if (hasError) {
        throw error;
      } else {
        deferred = config.promise = new Deferred<IteratorResult<T>>();
        const result = await deferred.promise;
        if (result.done) {
          return;
        } else {
          yield result.value;
        }
      }
    }
  } catch (err) {
    throw err;
  } finally {
    subs.unsubscribe();
  }
}

export type CoroutineConfig<T> = {
  promise?: Deferred<IteratorResult<T>>;
  forget?: () => void;
  remember?: () => void;
  enabled: boolean;
}
