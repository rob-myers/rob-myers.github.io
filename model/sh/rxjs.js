import { killError } from 'model/sh/sh.util';

/**
 * Convert an observable into an async generator which can be yielded.
 * Based on https://github.com/parzh/observable-to-async-generator/blob/main/src/index.ts
 * @template T
 * @param {import('rxjs').Observable<T>} observable
 * @param {import('store/session.store').ProcessMeta} process
 * @returns {AsyncIterableIterator<T>}
 */
export async function *otag(observable, process) {
  /** @type {Deferred<T>} */
	let deferred = defer();
	let finished = false;

  const subscription = observable.subscribe({
    next(value) {
      // Resolve value using deferred promise,
      // creating another deferred promise for future values
      window.setTimeout(() => {
        const result = deferred;
        deferred = defer();
        result.resolve(value);
      });
    },
    error(err) {
      // Reject error using deferred promise,
      // creating another deferred promise for future values
      window.setTimeout(() => {
        const result = deferred;
        deferred = defer();
        result.reject(err);
      });
    },
    complete() {
      window.setTimeout(() => {
        finished = true;
        deferred.resolve();
      });
    },
  });

  process.cleanups.push(
    () => deferred.reject(killError(process)),
    () => subscription.unsubscribe(),
  );

  try {
    while (true) {
      const value = await deferred;
      if (finished) break; // ?
      yield value;
    }
  } finally {
    subscription.unsubscribe();
  }
}

/**
 * @typedef Deferred
 * @type {{ resolve(value?: V): void; reject(error: Error): void } & Promise<V>}
 * @template [V=unknown]
 */

/**
 * @internal
 * @template T
 * @returns {Deferred<T>}
 */
export default function defer() {
	const transit = /** @type {Deferred<T>} */ ({});

  /** @type {Promise<T>} */
	const promise = new Promise((resolve, reject) => {
		Object.assign(transit, { resolve, reject });
	});

	return Object.assign(promise, transit);
}
