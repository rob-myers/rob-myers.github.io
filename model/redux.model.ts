import { RootAction, RootState } from '../store/reducer';
import { KeyedLookup } from '@model/generic.model';
import { OsWorkerState, OsWorkerAction } from '@worker/os.worker';
import { Service } from '@service/create-services';

//#region sync
export interface SyncAct<T extends string, Payload extends null | {}> {
  type: T;
  pay: Payload;
}

export const createAct = <T extends string, P extends object = {}>(
  type: T,
  payload: P
): SyncAct<T, P> => ({ pay: payload, type });

/**
 * We create sync actions differently for operating system.
 */
export function createOsAct<
  T extends string,
  Act extends SyncAct<T, Act['pay']>
>(actKey: T) {
  return (pay: Act['pay']) => ({ type: actKey, pay }) as Act;
}

export type SyncActDef<
  ActKey extends string,
  Act extends SyncAct<ActKey, Act['pay']>,
  State
> = (payload: Act['pay'], state: State) => State;

//#endregion


//#region thunk
export interface RootThunkParams {
  dispatch: <T extends RootAction | ThunkAct<string, any, any>>(arg: T) => ThunkActReturnType<T>;
  getState: () => RootState;
  state: RootState;
}

export interface OsThunkParams {
  dispatch: <T extends OsWorkerAction | OsThunkAct<string, any, any>>(arg: T) => ThunkActReturnType<T>;
  getState: () => OsWorkerState;
  state: OsWorkerState;
  /**
   * TODO
   */
  service: Service;
}

export interface ThunkAct<T extends string, A extends {}, R> {
  type: T;
  thunk: (params: RootThunkParams, args: A) => R;
  args: A;
}

export interface OsThunkAct<T extends string, A extends {}, R> {
  type: T;
  thunk: (params: OsThunkParams, args: A) => R;
  args: A;
}

export type ThunkActReturnType<T> = T extends ThunkAct<string, any, infer R> ? R : any;

/**
 * Thunk factory inferring args from parameter.
 */
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
 * We create thunks differently for operating system.
 */
export const createOsThunk  = <
  T extends string,
  Act extends OsThunkAct<T, Act['args'], R>,
  R = void
>(type: T, thunk: Act['thunk']) => (args: Act['args']) =>
    ({
      type,
      thunk,
      args
    } as Act);

//#endregion

export interface DispatchOverload {
  <ActKey extends string = string, Payload = any>(action: SyncAct<ActKey, Payload>): void;
  <ActKey extends string = string, ReturnValue = any>(action: ThunkAct<ActKey, any, ReturnValue>): ReturnValue;
}

export interface OsDispatchOverload {
  <ActKey extends string = string, Payload = any>(action: SyncAct<ActKey, Payload>): void;
  <ActKey extends string = string, ReturnValue = any>(action: OsThunkAct<ActKey, any, ReturnValue>): ReturnValue;
}

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
