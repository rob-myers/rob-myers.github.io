import { KeyedLookup } from 'model/generic.model';

export function addToLookup<LookupItem extends { key: string }>(
  newItem: LookupItem,
  lookup: KeyedLookup<LookupItem>
): KeyedLookup<LookupItem> {
  return { ...lookup, [newItem.key]: newItem };
}

export function removeFromLookup<LookupItem extends { key: string }>(
  itemKey: string,
  lookup: KeyedLookup<LookupItem>
): KeyedLookup<LookupItem> {
  const { [itemKey]: _, ...rest } = lookup;
  return rest;
}

export function updateLookup<LookupItem extends { key: string }>(
  itemKey: string,
  lookup: KeyedLookup<LookupItem>,
  updater: ReduxUpdater<LookupItem>
): KeyedLookup<LookupItem> {

  if (!lookup[itemKey]) {
    return lookup;
  }
  const updates = updater(lookup[itemKey]);
  if (!updates) { // falsy means don't update
    return lookup; 
  }

  return {
    ...lookup,
    [itemKey]: {
      ...lookup[itemKey],
      ...updates
    }
  };
}

export type ReduxUpdater<LookupItem extends { key: string | number }> = (
  item: LookupItem
) => Partial<LookupItem>;

export type CustomUpdater<Item extends { key: string | number }> = (
  | Partial<Item>
  | ReduxUpdater<Item>
);

export type SimpleUpdater<T> = (
  | Partial<T>
  | ((prev: T) => Partial<T>)
);
