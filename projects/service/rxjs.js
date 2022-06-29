/**
 * Convert an observable into an async generator which can be yielded.
 * Based on https://github.com/parzh/observable-to-async-generator/blob/main/src/index.ts
 * @template T
 * @param {import('rxjs').Observable<T>} observable
 * @param {(deferred: { promise: Deferred<T> }, subscription: import('rxjs').Subscription) => void } [initiate]
 * @returns {AsyncIterableIterator<T>}
 */
export async function *otag(observable, initiate) {
  /** @type {{ promise: Deferred<T> }} */
	const deferred = { promise: defer() };
	let finished = false;

  const subscription = observable.subscribe({
    next(value) {
      // Resolve value using deferred promise,
      // creating another deferred promise for future values
      window.setTimeout(() => {
        const result = deferred.promise;
        deferred.promise = defer();
        result.resolve(value);
      });
    },
    error(err) {
      // Reject error using deferred promise,
      // creating another deferred promise for future values
      window.setTimeout(() => {
        const result = deferred.promise;
        deferred.promise = defer();
        result.reject(err);
      });
    },
    complete() {
      window.setTimeout(() => {
        finished = true;
        deferred.promise.resolve();
      });
    },
  });

  initiate?.(deferred, subscription);

  try {
    while (true) {
      const value = await deferred.promise;
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

/**
 * We now provide various types which can be imported into namespaces.
 */

/** @typedef {typeof otag} otag */

import { filter, first, map, take } from 'rxjs/operators';

/** @typedef {typeof filter} filter */
/** @typedef {typeof first} first */
/** @typedef {typeof map} map */
/** @typedef {typeof take} take */
