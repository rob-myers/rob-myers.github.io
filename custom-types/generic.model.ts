export interface KeyedLookup<Value extends { key: string }> {
  [key: string]: Value;
}
