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
