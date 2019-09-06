/**
 * Exclude keys K from T.
 */
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

/**
 * Merge two types by (1) removing N's keys from M, (2) extending with N.
 * https://stackoverflow.com/a/53936938/2917822
 */
export type Merge<M, N> = Omit<M, Extract<keyof M, keyof N>> & N;

export type KeyedLookup<Key extends string | number, Value extends { key: Key }> = {
  [key in Key]: Value
};

export type ArgumentTypes<F extends (...args: any[]) => any> = F extends (...args: infer A) => any
  ? A
  : never;

/**
 * Pretty-print JSON.
 */
export function pretty(input: any): string {
  return JSON.stringify(input, null, "\t");
}

/**
 * Usage `default: throw testNever(x)`.
 */
export function testNever(x: never): string {
  return `testNever: ${pretty(x)} not implemented.`;
}
