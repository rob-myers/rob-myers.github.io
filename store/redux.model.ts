import { RootAction, RootState } from './reducer';
import { KeyedLookup } from '@model/generic.model';

export const createAct = <T extends string, P extends object = {}>(
  type: T,
  payload?: P
) => ({ ...payload, type }) as P & { type: T };

export interface ThunkParams {
  // dispatch: Dispatch<RootAction | ThunkAct<string, any, any>>;
  dispatch: <T extends RootAction | ThunkAct<string, any, any>>(arg: T) => ThunkActReturnType<T>;
  getState: () => RootState;
  state: RootState;
}

export interface ThunkAct<T extends string, A extends {}, R> {
  type: T;
  thunk: (params: ThunkParams, args: A) => R;
  args: A;
}

export type ThunkActReturnType<T> = T extends ThunkAct<string, any, infer R> ? R : any;

export const createThunk = <T extends string, A extends {} = {}, R = void>(
  type: T,
  thunk: ThunkAct<T, A, R>['thunk']
) => (args: A) =>
    ({
      type,
      thunk,
      args
    } as ThunkAct<T, A, R>);

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

type ReduxUpdater<LookupItem extends { key: string }> = (
  item: LookupItem
) => Partial<LookupItem>;
