import { KeyedLookup } from '@model/generic.model';

/**
 * Synchronous actions
 */
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


/**
 * Thunks
 */
import { RootState, RootAction, RootActOrThunk } from '@store/reducer';

export interface RootThunkParams {
  dispatch: <T extends RootAction | ThunkAct<string, any, any>>
    (arg: T) => ThunkActReturnType<T>;
  getState: () => RootState;
  state: RootState;
}

export type ThunkActReturnType<T> = T extends ThunkAct<string, any, infer R> ? R : any;

export interface ThunkAct<T extends string, A extends {}, R> {
  type: T;
  thunk: (params: RootThunkParams, args: A) => R;
  args: A;
}

// We additionally assign { type } for our custom thunk middleware
export const createThunk = <T extends string, A extends {} = {}, R = void>(
  type: T,
  thunk: ThunkAct<T, A, R>['thunk'],
) => Object.assign((args: A) =>
  ({
    type,
    thunk,
    args,
  } as ThunkAct<T, A, R>), { type });

/**
 * Epics
 */
import { ActionsObservable, StateObservable } from 'redux-observable';
import { Observable } from 'rxjs';

export const createEpic = <T extends RootActOrThunk>(
  arg: (
    action$: ActionsObservable<RootActOrThunk>,
    _state$: StateObservable<RootState>,
  ) => Observable<T>
) => arg;

/**
 * Duck typings typescript utils
 */
interface ActionCreatorsMapObject {
  [actionCreator: string]: (...args: any[]) => any;
}
export type ActionsUnion<A extends ActionCreatorsMapObject> = ReturnType<A[keyof A]>;


/**
 * Redacting large/cyclic objects
 */

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

/** Handle huge/cyclic objects by redacting them. */
export const replacer = (_: any, value: RedactInReduxDevTools) =>
  value && value.devToolsRedaction
    ? `Redacted<${value.devToolsRedaction}>`
    : typeof value === 'function' ? 'Redacted<function>' : value

/**
 * Reducer utils i.e. add/remove/update lookup.
 */
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
      ...updates,
      key: itemKey, // Prevent key overwrite
    }
  };
}

export type ReduxUpdater<LookupItem extends { key: string }> = (
  item: LookupItem
) => Partial<LookupItem>;
