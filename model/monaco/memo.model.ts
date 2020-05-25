/**
 * Source https://github.com/microsoft/fluentui/blob/master/packages/utilities/src/memoize.ts
 */
let _resetCounter = 0;
const _emptyObject = { empty: true };
const _dictionary = {} as Record<any, any>;

export function resetMemoizations(): void {
  _resetCounter++;
}

interface IMemoizeNode {
  map: WeakMap<any, any>;
  value?: any;
}

function _createNode(): IMemoizeNode {
  return {
    map: new WeakMap(),
  };
}

function _normalizeArg(val: null | undefined): { empty: boolean } | any;
function _normalizeArg(val: object): any;
function _normalizeArg(val: any): any {
  if (!val) {
    return _emptyObject;
  } else if (typeof val === 'object' || typeof val === 'function') {
    return val;
  } else if (!_dictionary[val]) {
    _dictionary[val] = { val };
  }

  return _dictionary[val];
}

/**
 * Memoizes a function; when you pass in the same parameters multiple times, it returns a cached result.
 * Be careful when passing in objects, you need to pass in the same INSTANCE for caching to work. Otherwise
 * it will grow the cache unnecessarily. Also avoid using default values that evaluate functions; passing in
 * undefined for a value and relying on a default function will execute it the first time, but will not
 * re-evaluate subsequent times which may have been unexpected.
 *
 * By default, the cache will reset after 100 permutations, to avoid abuse cases where the function is
 * unintendedly called with unique objects. Without a reset, the cache could grow infinitely, so we safeguard
 * by resetting. To override this behavior, pass a value of 0 to the maxCacheSize parameter.
 *
 * @public
 * @param cb - The function to memoize.
 * @param maxCacheSize - Max results to cache. If the cache exceeds this value, it will reset on the next call.
 * @param ignoreNullOrUndefinedResult - Flag to decide whether to cache callback result if it is undefined/null.
 * If the flag is set to true, the callback result is recomputed every time till the callback result is
 * not undefined/null for the first time, and then the non-undefined/null version gets cached.
 * @returns A memoized version of the function.
 */
export function memoizeFunction<T extends (...args: any[]) => RET_TYPE, RET_TYPE>(
  cb: T,
  maxCacheSize = 100,
  ignoreNullOrUndefinedResult = false,
): T {
  let rootNode: any;
  let cacheSize = 0;
  let localResetCounter = _resetCounter;

  // tslint:disable-next-line:no-function-expression
  return function memoizedFunction(...args: any[]): RET_TYPE {
    let currentNode: any = rootNode;

    if (
      rootNode === undefined ||
      localResetCounter !== _resetCounter ||
      (maxCacheSize > 0 && cacheSize > maxCacheSize)
    ) {
      rootNode = _createNode();
      cacheSize = 0;
      localResetCounter = _resetCounter;
    }

    currentNode = rootNode;

    // Traverse the tree until we find the match.
    for (let i = 0; i < args.length; i++) {
      const arg = _normalizeArg(args[i]);

      if (!currentNode.map.has(arg)) {
        currentNode.map.set(arg, _createNode());
      }

      currentNode = currentNode.map.get(arg);
    }

    // eslint-disable-next-line no-prototype-builtins
    if (!currentNode.hasOwnProperty('value')) {
      currentNode.value = cb(...args);
      cacheSize++;
    }

    if (ignoreNullOrUndefinedResult && (currentNode.value === null || currentNode.value === undefined)) {
      currentNode.value = cb(...args);
    }

    return currentNode.value;
  } as any;
}
