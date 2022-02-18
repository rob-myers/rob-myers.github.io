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
 * JSDoc types lack a non-null assertion.
 * https://github.com/Microsoft/TypeScript/issues/23405#issuecomment-873331031
 * @template T
 * @param {T} value
 * @param {string} [valueName]
 * @returns {T extends undefined | null ? never : T}
 */
 export function assertNonNull(value, valueName) {
  if (value == null) {
    throw new Error(`Encountered unexpected null or undefined value${valueName? ` for '${valueName}'` : ""}`);
  }
  return /** @type {*} */ (value);
}

/**
 * Test equality, i.e. test fn `equality`,
 * falling back to primitive equality, and recurse on arrays.
 * @param {*} x
 * @param {*} y
 * @returns {boolean}
 */
export function equals(x, y, depth = 0) {
  if (typeof x?.equals === 'function') {
    return x.equals(y) === true;
  } else if (Array.isArray(x)) {
    if (depth > 10) {
      throw Error('equals: recursive depth exceeded 10');
    }
    return x.every((u, i) => equals(u, /** @type {*} */ (y)[i]), depth + 1);
  }
  return x === y;
}
