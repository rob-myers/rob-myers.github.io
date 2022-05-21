export function pause(ms = 0) {
  return new Promise<void>(r => setTimeout(() => r(), ms));
}

export function flatten<T>(items: (T | T[])[]): T[] {
  return ([] as T[]).concat(...items);
}

/** Construct `x` modulo `modulus` ensuring positive */
export function posModulo(x: number, modulus: number) {
  return x < 0 ? modulus + x % modulus : x % modulus;
}

export function chooseRandomItem<T>(items: T[]) {
  return items[Math.floor(items.length * Math.random())] || null;
}

export function lookupFromValues<T extends { key: string }>(values: T[]): TypeUtil.KeyedLookup<T> {
  return values.reduce((agg, item) => ({ ...agg, [item.key]: item }), {} as TypeUtil.KeyedLookup<T>);
}

export function tryParseJson(input: any) {
  try {
    return JSON.parse(input);
  } catch (e) {
    return undefined;
  }
}

export function deepGet(obj: any, path: string[]) {
  return path.reduce((agg, part) => agg[part], obj);
}

/** foo-bar-baz to fooBarBaz */
export function kebabToCamel(text: string) {
  return text.replace(/-(.)/g, (_, c: string) => c.toUpperCase());
}

export function truncateOneLine(text: string, maxLength = 50) {
  text = text.trimLeft();
  const isLong = text.length > maxLength;
  return isLong ? `${text.split('\n', 1)[0].slice(0, maxLength)} ...` : text;
}

export class Deferred<T> {
  resolve: (value: T | PromiseLike<T>) => void = null!;
  reject: (reason?: any) => void = null!;
  promise = new Promise<T>((resolve, reject) => {
    this.resolve = resolve;
    this.reject = reject;
  });
}

/**
 * First available non-negative integer given a
 * pre-existing list of non-negative integers.
 */
 export function firstAvailableInteger(nonNegativeInts: number[]) {
  if (nonNegativeInts.length) {
    const extended = nonNegativeInts.concat(NaN);
    return extended.findIndex((_, i) => !extended.includes(i));
  }
  return 0;
}

export function keysDeep(obj: any): string[] {
  return Array.from(deepKeys(obj));
}

/**
 * Iterate deep keys separated by `/`.
 * https://stackoverflow.com/a/65571163/2917822
 */
function* deepKeys(t: any, path: string[] = []): IterableIterator<string> {
  switch(t?.constructor) {
    case Object:
      for (const [k,v] of Object.entries(t))
        yield* deepKeys(v, [...path, k])
      break;
    default:
      yield path.join("/");
  }
}
