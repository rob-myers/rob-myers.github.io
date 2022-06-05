import prettyCompact from 'json-stringify-pretty-compact';
import safeStableStringify from 'safe-stable-stringify';

/**
 * @template {{ key: string }} LookupItem
 * @param {LookupItem} newItem 
 * @param {TypeUtil.KeyedLookup<LookupItem>} lookup 
 * @returns {TypeUtil.KeyedLookup<LookupItem>}
 */
export function addToLookup(newItem, lookup) {
  return { ...lookup, [newItem.key]: newItem };
}

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
 * Clone serializable data `input`, e.g. not regexes.
 * @template T
 * @param {T} input 
 * @returns {T}
 */
export function deepClone(input) {
  return JSON.parse(JSON.stringify(input));
}

/**
 * Iterate deep keys separated by `/`.
 * https://stackoverflow.com/a/65571163/2917822
 * @param {any} t
 * @param {string[]} path
 * @returns {IterableIterator<string>}
 */
function* deepKeys(t, path = []) {
  switch(t?.constructor) {
    case Object:
      for (const [k,v] of Object.entries(t))
        yield* deepKeys(v, [...path, k])
      break;
    default:
      yield path.join("/");
  }
}

/**
 * 
 * @param {any} obj 
 * @param {string[]} path 
 * @returns 
 */
export function deepGet(obj, path) {
  return path.reduce((agg, part) => agg[part], obj);
}

/**
 * @template T
 */
export class Deferred {
  /** @type {(value: T | PromiseLike<T>) => void} */
  resolve = () => {};
  /** @type {(reason?: any) => void} */
  reject = () => {};
  /** @type {Promise<T>} */
  promise = new Promise((resolve, reject) => {
    this.resolve = resolve;
    this.reject = reject;
  });
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
 * @template T
 * @param {(T | T[])[]} items
 */
export function flatten(items) {
  return /** @type {T[]} */ ([]).concat(...items);
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
 * @template {string} K
 * @param {Partial<Record<K, any>> | Record<K, any>} record
 * Typed `Object.keys`, usually as finitely many string literals.
 */
export function keys(record) {
  return /** @type {K[]} */ (Object.keys(record));
}

/**
 * @param {any} obj 
 * @returns {string[]}
 */
export function keysDeep(obj) {
  return Array.from(deepKeys(obj));
}

/**
 * @template T
 * @param {T[]} items 
 * @returns {T | undefined}
 */
export function last(items) {
  return items[items.length - 1];
}

/**
 * @template T
 * @param {T[]} items 
 * @returns {T}
 */
export function extantLast(items) {
  return items[items.length - 1];
}

/**
 * @template {{ key: string }} T
 * @param {T[]} values 
 * @returns {TypeUtil.KeyedLookup<T>}
 */
export function lookupFromValues(values)  {
  return values.reduce(
    (agg, item) => ({ ...agg, [item.key]: item }),
    /** @type {TypeUtil.KeyedLookup<T>} */ ({}),
  );
}

/**
 * @template SrcValue
 * @template DstValue
 * @template {string} Key
 * @param {Record<Key, SrcValue>} input
 * @param {(value: SrcValue, key: string) => DstValue} transform
 * Given `{ [key]: value }`, returns fresh
 * `{ [key]: _transform_(value) }`.
 */
export function mapValues(input, transform) {
  const output = /** @type {Record<Key, DstValue>} */ ({});
  keys(input).forEach((key) => output[key] = transform(input[key], key));
  return output;
}

/**
 * Pretty-print JSON.
 * @param {any} input 
 * @returns {string}
 */
export function pretty(input) {
  // return JSON.stringify(input, null, '\t');
  return prettyCompact(input);
}

/** @returns {Promise<void>} */
export function pause(ms = 0) {
  return new Promise(r => setTimeout(() => r(), ms));
}

/** @param {any} input */
export function safeStringify(input) {
  if (typeof input === 'function') {
    return zealousTrim(`${input}`);
  }
  return tryJsonStringify(input) || safeStableStringify(input, (_k, v) => {
    if (v instanceof HTMLElement)
      return `HTMLElement[${v.nodeName}]`;
    return v;
  });
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
 * @template T
 * @param {T[]} items 
 */
export function removeDups(items) {
  return Array.from(new Set(items));
}

/**
 * @template {{ key: string }} LookupItem
 * @param {string} itemKey 
 * @param {TypeUtil.KeyedLookup<LookupItem>} lookup 
 * @returns {TypeUtil.KeyedLookup<LookupItem>}
 */
export function removeFromLookup(itemKey, lookup) {
  const { [itemKey]: _, ...rest } = lookup;
  return rest;
}

/**
 * Usage `default: throw testNever(x)`.
 * @param {never} x 
 * @returns {string}
 */
export function testNever(x) {
  return `testNever: ${pretty(x)} not implemented.`;
}

/**
 * @param {string} text 
 * @returns 
 */
export function truncateOneLine(text, maxLength = 50) {
  text = text.trimLeft();
  const isLong = text.length > maxLength;
  return isLong ? `${text.split('\n', 1)[0].slice(0, maxLength)} ...` : text;
}

/** @param {any} input */
function tryJsonStringify(input) {
  try {
    let ownKeys = /** @type {string[]} */ ([]);
    return JSON.stringify(input, (_k, v) => {
      if (typeof v === 'function') {
        return `[Function]${(ownKeys = Object.keys(v)).length ? ` ...{${ownKeys}} ` : ''}`;
      }
      return v;
    })
  } catch {};
}

/**
 * @param {string} key 
 */
export function tryLocalStorageGet(key, logErr = false) {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    logErr && console.error(e);
    return null;
  };
}

/**
 * @param {string} key 
 * @param {string} value 
 */
export function tryLocalStorageSet(key, value, logErr = true) {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    logErr && console.error(e);
  };
}

/** @param {string} input */
function zealousTrim(input) {
  return input.trim().replace(/\s\s+/g, ' ').trim();
}
