import { KeyedLookup } from '@model/generic.model';

//#region sync
export interface SyncAct<T extends string, Payload extends null | {}> {
  type: T;
  pay: Payload;
}

export const createAct = <T extends string, P extends object = {}>(
  type: T,
  payload: P
): SyncAct<T, P> => ({ pay: payload, type });

export type SyncActDef<
  ActKey extends string,
  Act extends SyncAct<ActKey, Act['pay']>,
  State
> = (payload: Act['pay'], state: State) => State;

//#endregion


/**
 * If this key is in action's payload, said payload
 * will be replaced by its string value in redux devtools.
 * Prevents redux devtools from crashing via large/cyclic objects.
 */
export interface RedactInReduxDevTools {
  /** Parent object will be serialised as Redacted<{devToolsRedaction}> */
  devToolsRedaction: string;
}

export type Redacted<T> = RedactInReduxDevTools & T;

/**
 * Mutate object with property 'devToolsRedaction'.
 * We've configured redux dev-tools to replace it by `Redact<{object.devToolsRedaction}>`.
 */
export function redact<T extends {}>(object: T, devToolsRedaction?: string) {
  // tslint:disable-next-line: prefer-object-spread
  return Object.assign<T, RedactInReduxDevTools>(
    object,
    { devToolsRedaction: devToolsRedaction || `${object.constructor.name}` }
  );
}

type ActionCreatorsMapObject = { [actionCreator: string]: (...args: any[]) => any }
export type ActionsUnion<A extends ActionCreatorsMapObject> = ReturnType<A[keyof A]>;


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

export type ReduxUpdater<LookupItem extends { key: string }> = (
  item: LookupItem
) => Partial<LookupItem>;

/** Handle huge/cyclic objects by redacting them. */
export const replacer = (_: any, value: RedactInReduxDevTools) => {
  if (value && value.devToolsRedaction) {
    return `Redacted<${value.devToolsRedaction}>`;
  }
  return value;
};
