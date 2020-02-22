export interface KeyedLookup<Value extends { key: string }> {
  [key: string]: Value;
}

export function flatten<T>(items: (T | T[])[]): T[] {
  return ([] as T[]).concat(...items);
}

export function chooseRandomItem<T>(items: T[]) {
  return items[Math.floor(items.length * Math.random())] || null;
}

export function last<T>(items: T[]): T | undefined {
  return items[items.length - 1];
}

export type Triple<T> = [T, T, T];

/**
 * Given `{ key: 'foo', bar: number; } | { key: 'baz', qux: boolean; }`
 * outputs `{ foo: { bar: number }, baz: { qux: boolean; }}`.
 */
export type KeyedUnionToLookup<T extends { key: string }> = {
  [K in T['key']]: Omit<Extract<T, { key: K }>, 'key'>
}

/**
 * Remove the _first_ occurrence of `elem` from _`array`_,
 * mutating the latter if the former exists.
 */
export function removeFirst<T>(array: T[], elem: T): T[] {
  const firstIndex = array.indexOf(elem);
  if (firstIndex !== -1) {
    array.splice(firstIndex, 1);
  }
  return array;
}
