/** 
 * JSDoc types lack a non-null assertion.
 * https://github.com/Microsoft/TypeScript/issues/23405#issuecomment-873331031
 *
 * Throws if the supplied value is _undefined_ (_null_ is allowed).\
 * Returns (via casting) the supplied value as a T with _undefined_ removed from its type space.
 * This informs the compiler that the value cannot be _undefined_.
 * @template T
 * @param {T} value
 * @param {string} [valueName]
 * @returns {T extends undefined ? never : T}
 */
export function assertDefined(value, valueName) {
  if (value === undefined) {
    throw new Error(`Encountered unexpected undefined value${valueName? ` for '${valueName}'` : ""}`);
  }
  return /** @type {*} */ (value);
}

/** 
 * JSDoc types lack a non-null-or-undefined assertion.
 * https://github.com/Microsoft/TypeScript/issues/23405#issuecomment-873331031
 * @template T
 * @param {T} value
 * @returns {T extends undefined | null ? never : T}
 */
 export function assertNonNull(value, ensureNull = true) {
  if (ensureNull && value == null) {
    throw new Error(`Encountered unexpected null or undefined value`);
  }
  return /** @type {*} */ (value);
}

/**
 * Test equality, i.e. test fn `equality`,
 * falling back to primitive equality,
 * and recurse on arrays/objects.
 * @param {*} x
 * @param {*} y
 * @returns {boolean}
 */
export function equals(x, y, depth = 0) {
  if (depth > 10) {
    throw Error('equals: recursive depth exceeded 10');
  }
  if (x !== undefined && y === undefined) {
    return false;
  } else if (typeof x?.equals === 'function') {
    return x.equals(y) === true;
  } else if (Array.isArray(x)) {
    return x.every((u, i) => equals(u, y[i]), depth + 1)
      && x.length === y.length;
  } else if (isPlainObject(x)) {
    return Object.keys(x).every((key) => equals(x[key], y[key]), depth + 1)
      && Object.keys(x).length === Object.keys(y).length;
  } else {
    return x === y;
  }
}

/**
 * https://github.com/sindresorhus/is-plain-obj/blob/main/index.js
 * @param {*} value 
 * @returns 
 */
 export function isPlainObject(value) {
	if (Object.prototype.toString.call(value) !== '[object Object]') {
		return false;
	}

	const prototype = Object.getPrototypeOf(value);
	return prototype === null || prototype === Object.prototype;
}

/**
 * @template T
 * @param {(T | T[])[]} items
 */
export function flatten(items) {
  return /** @type {T[]} */ ([]).concat(...items);
}

/**
 * Remove the _first_ occurrence of `elem` from _`array`_,
 * **mutating** the latter if the former exists.
 * @template T
 * @param {T[]} array
 * @param {T} elem
 */
 export function removeFirst(array, elem) {
  const firstIndex = array.indexOf(elem);
  if (firstIndex !== -1) {
    array.splice(firstIndex, 1);
  }
  return array;
}

/**
 * Clone serializable data `input`, e.g. not regexes.
 * @template T
 * @param {T} input 
 * @returns {T}
 */
export function deepClone(input) {
  return JSON.parse(JSON.stringify(input));
}

/**
 * @template {string} K
 * @param {Partial<Record<K, any>> | Record<K, any>} record
 * Typed `Object.keys`, usually as finitely many string literals.
 */
export function keys(record) {
  return /** @type {K[]} */ (Object.keys(record));
}

/**
 * @template T
 * @param {T[]} items 
 */
export function removeDups(items) {
  return Array.from(new Set(items));
}
