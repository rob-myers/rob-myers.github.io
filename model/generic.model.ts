import fastSafeStringify from 'fast-safe-stringify';

export interface KeyedLookup<Value extends { key: K }, K extends string = string> {
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

export function pause(ms = 0) {
  return new Promise(r => setTimeout(() => r(), ms));
}

/**
 * - _range(3)_ is `[0, 1, 2]`,
 * - _range(3, 5)_ is `[3, 4, 5]` i.e. inclusive.
 */
export function range(fromPos: number, toPos?: number): number[] {
  if (toPos == null) {
    return Array.from(Array(fromPos), (_, i) => i);
  }
  return range((toPos - fromPos) + 1)
    .map((x: number) => x + fromPos);
}

/**
 * Pretty-print JSON.
 */
export function pretty(input: any): string {
  return JSON.stringify(input, null, '\t');
}

/**
 * Usage `default: throw testNever(x)`.
 */
export function testNever(x: never): string {
  return `testNever: ${pretty(x)} not implemented.`;
}

/**
 * Typed `Object.keys`, usually as finitely many string literals.
 */
export function keys<K extends string>(
  record: (
    | Partial<Record<K, any>>
    | Record<K, any>
  )
) {
  return Object.keys(record) as K[];
}

/**
 * Clone serializable data `input`, e.g. not regexes.
 */
export function deepClone<T>(input: T): T {
  return JSON.parse(JSON.stringify(input));
}

export function withoutProperty<T extends {}>(
  object: T,
  ...properties: string[]
) {
  properties.forEach((property) => delete (object as any)[property]);
  return object;
}

/**
 * Given `{ [key]: value }`, returns fresh
 * `{ [key]: _transform_(value) }`.
 */
export function mapValues<SrcValue, DstValue, Key extends string = string>(
  input: Record<Key, SrcValue>,
  transform: (value: SrcValue) => DstValue,
) {
  const output = {} as Record<Key, DstValue>;
  keys(input).forEach((key) => output[key] = transform(input[key]));
  return output;
}

/**
 * Unpack the typing of `T` i.e.
 * - If `T` an array use the item's type,
 * - elseif `T` a function use its return type,
 * - elseif `T` a promise use its resolved type,
 * - else use `T` itself.
 *
 * https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html
 */
export type Unpacked<T> =
  T extends (infer U)[] ? U :
    T extends (...args: any[]) => infer U ? U :
      T extends Promise<infer U> ? U :
        T;

/**
 * Create fresh array containing {item} without adding duplicate.
 */
export function ensureArrayItem<T>(array: undefined | T[], item: T): T[] {
  if (Array.isArray(array)) {
    return array.find((x) => x === item)
      ? array.slice()
      : array.concat(item);
  }
  return [item];
}

/**
 * Is {input} the string representation of a valid integer?
 */
export function isStringInt(input: string, mustBeNonNegative = false): boolean {
  const parsed = parseInt(input);
  return input === `${parsed}`
    && !Number.isNaN(parsed)
    && (!mustBeNonNegative || parsed >= 0);
}

/** Construct `x` modulo `modulus` ensuring positive */
export function posModulo(x: number, modulus: number) {
  return x < 0 ? modulus + x % modulus : x % modulus;
}

export function removeDups<T>(items: T[]) {
  return Array.from(new Set(items));
}

export function intersects<T>(items: T[], others: T[]) {
  return items.some(item => others.includes(item));
}

export function assign<Dst extends {}, Src extends {}>(
  dst: Dst, src: Src,
): Dst & Src {
  return Object.assign<Dst, Src>(dst, src);
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

export function lookupFromValues<T extends { key: string }>(values: T[]): KeyedLookup<T> {
  return values.reduce((agg, item) => ({ ...agg, [item.key]: item }), {} as KeyedLookup<T>);
}

export function pluck<T extends { key: string }>(
  lookup: KeyedLookup<T>,
  test: (item: T) => boolean 
) {
  const shallow = { ...lookup };
  Object.values(lookup).forEach((item) => !test(item) && delete shallow[item.key]);
  return shallow;
}

export type DistributiveOmit<T, K extends keyof T> = T extends unknown
  ? Omit<T, K>
  : never;

export function safeStringify(input: any) {
  return tryJsonStringify(input) || fastSafeStringify(input);
}

function tryJsonStringify(input: any) {
  try {
    return JSON.stringify(input);
  } catch (e) {}
}

export function isArrayOrObject(input: any) {
  return input instanceof Array ||
    (input && typeof input === 'object');
}