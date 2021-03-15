/** https://github.com/ReactiveX/rxjs/blob/3f3c614d8b86c68d271a1db995ff11c61842e757/src/internal/asyncIteratorFrom.ts#L4 */
import { Observable } from "rxjs";
import { Deferred } from "./deferred";

export type Bucket<T> = { promise?: Deferred<IteratorResult<T>> };

export function asyncIteratorFrom<T>(
  source: Observable<T>,
  bucket: Bucket<T>,
) {
  return coroutine(source, bucket);
}

async function* coroutine<T>(
  source: Observable<T>,
  bucket: Bucket<T>,
) {
  const deferreds: Deferred<IteratorResult<T>>[] = [];
  const values: T[] = [];
  let hasError = false;
  let error: any = null;
  let completed = false;

  const subs = source.subscribe({
    next: value => {
      if (deferreds.length > 0) {
        deferreds.shift()!.resolve({ value, done: false });
      } else {
        values.push(value);
      }
    },
    error: err => {
      hasError = true;
      error = err;
      while (deferreds.length > 0) {
        deferreds.shift()!.reject(err);
      }
    },
    complete: () => {
      completed = true;
      while (deferreds.length > 0) {
        deferreds.shift()!.resolve({ value: undefined, done: true });
      }
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
        // const d = (source as any).__deferred__ = new Deferred<IteratorResult<T>>();
        const d = bucket.promise = new Deferred<IteratorResult<T>>();
        deferreds.push(d);
        const result = await d.promise;
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
