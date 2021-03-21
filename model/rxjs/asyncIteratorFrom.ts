/** https://github.com/ReactiveX/rxjs/blob/3f3c614d8b86c68d271a1db995ff11c61842e757/src/internal/asyncIteratorFrom.ts#L4 */
import { Observable } from "rxjs";
import { Deferred } from "./deferred";

export type Bucket<T> = {
  promise?: Deferred<IteratorResult<T>>;
  forget?: () => void;
  remember?: () => void;
  enabled: boolean;
};

export function asyncIteratorFrom<T>(
  source: Observable<T>,
  bucket: Bucket<T>,
) {
  bucket.forget = () => (bucket.enabled = false);
  bucket.remember = () => (bucket.enabled = true);
  bucket.enabled = true;
  return coroutine(source, bucket);
}

async function* coroutine<T>(
  source: Observable<T>,
  bucket: Bucket<T>,
) {
  let deferred = null as null | Deferred<IteratorResult<T>>;
  const values: T[] = [];
  let hasError = false;
  let error: any = null;
  let completed = false;

  const subs = source.subscribe({
    next: value => {
      if (!bucket.enabled) {
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
        deferred = bucket.promise = new Deferred<IteratorResult<T>>();
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
