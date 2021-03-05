import safeJsonStringify from 'safe-json-stringify';

/** Useful for state management */
export interface KeyedLookup<Value extends { key: K }, K extends string = string> {
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
  return range((toPos - fromPos) + 1)
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
    return null;
  }
}
