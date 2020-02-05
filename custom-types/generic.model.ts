export type KeyedLookup<Key extends string | number, Value extends { key: Key }> = {
  [key in Key]: Value
};
