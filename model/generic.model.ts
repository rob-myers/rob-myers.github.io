import safeJsonStringify from 'safe-json-stringify';

/** Useful for state management */
export interface KeyedLookup<Value extends { key: K }, K extends string | number = string | number> {
  [key: string]: Value;
}

export type Pair<T> = [T, T];

export type Triple<T> = [T, T, T];

/** Clone serializable data `input`, e.g. not regexes. */
export function deepClone<T>(input: T): T {
  return JSON.parse(JSON.stringify(input));
}

/** From, [to] inclusive */
export function range(fromPos: number, toPos?: number): number[] {
  if (toPos === undefined) {
    return Array.from(Array(fromPos), (_, i) => i);
  }
  return range(Math.max((toPos - fromPos) + 1, 0))
    .map((x: number) => x + fromPos);
}

/** Pretty-print JSON. */
export function pretty(input: any): string {
  return JSON.stringify(input, null, '\t');
}

/** Usage `default: throw testNever(x)`. */
export function testNever(x: never): string {
  return `testNever: ${pretty(x)} not implemented.`;
}

export function last<T>(items: T[]): T | undefined {
  return items[items.length - 1];
}

export function pause(ms = 0) {
  return new Promise<void>(r => setTimeout(() => r(), ms));
}

function tryJsonStringify(input: any) {
  try {
    return JSON.stringify(input);
  } catch (e) {}
}

export function safeStringify(input: any) {
  if (typeof input === 'function') {
    return zealousTrim(`${input}`);
  }
  return tryJsonStringify(input) || safeJsonStringify(input);
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

export function lookupFromValues<T extends { key: string }>(values: T[]): KeyedLookup<T> {
  return values.reduce((agg, item) => ({ ...agg, [item.key]: item }), {} as KeyedLookup<T>);
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

export function truncate(text: string, maxLength = 50) {
  return text.length <= maxLength
    ? text
    : `${text.slice(0, maxLength)} ...`;
}

/** Typed `Object.keys`, usually as finitely many string literals. */
export function keys<K extends string>(
  record: Partial<Record<K, any>> | Record<K, any>,
) {
  return Object.keys(record) as K[];
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

export function zealousTrim(input: string): string {
  return input.trim().replace(/\s\s+/g, ' ').trim();
}

/** https://flaviocopes.com/how-to-list-object-methods-javascript/ */
export function keysDeep(obj: any): string[] {
  const properties = new Set<string>();
  let currentObj = obj;
  do Object.getOwnPropertyNames(currentObj).map(item => properties.add(item));
  while ((currentObj = Object.getPrototypeOf(currentObj)));
  return [...properties.keys()];
}
