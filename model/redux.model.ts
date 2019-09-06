import { MiddlewareAPI } from "redux";
import { RootState, RootAction } from "@store/reducer";
import { KeyedLookup } from "./generic.model";

/**
 * If attached as part of an action's payload,
 * said payload will be replaced by string in redux devtools.
 * Prevents redux devtools from crashing when storing
 * large and/or cyclic objects.
 */
export interface RedactInReduxDevTools {
  /**
   * Parent object will be serialised as: Redacted<{devToolsRedaction}>
   */
  devToolsRedaction: string;
}

/**
 * Mutate object with property devToolsRedaction (see create-store.ts).
 * Redux dev-tools will replace objects with this property by the string
 * Redact<{object.devToolsRedaction}>.
 */
export function redact<T extends {}>(object: T, devToolsRedaction: string) {
  // tslint:disable-next-line: prefer-object-spread
  return Object.assign<T, RedactInReduxDevTools>(object, { devToolsRedaction });
}

/**
 * We may dispatch a synchronous action or a thunk.
 * _TODO_ refine this to existing actions.
 */
export interface Dispatch {
  <ActKey extends string = string, Payload = any>(action: SyncAct<ActKey, Payload>): void;
  <ActKey extends string = string, ReturnValue = any>(
    action: ThunkAct<ActKey, any, ReturnValue>
  ): ReturnValue;
}

// export type ActionType = SyncAct<string, any> | ThunkAct<string, any, any>;
// export type ActionType = RootSyncAction | ThunkAction;

/**
 * A base dispatched action.
 */
export interface BaseAct<ActKey extends string> {
  type: ActKey;
}

/**
 * A synchronous dispatchable action.
 * These are the only actions handled by reducers.
 * Our redux middleware will handle thunks.
 */
export type SyncAct<ActKey extends string, Payload extends {}> = Payload &
  BaseAct<ActKey> & {
    key: "sync";
    // payload: Payload;
  };

/**
 * A dispatchable action known as a 'thunk'.
 * They may dispatch other actions (sync or thunk).
 * They may have a return value.
 */
export interface ThunkAct<ActKey extends string, ActArgs extends {}, ReturnValue>
  extends BaseAct<ActKey> {
  key: "thunk";
  /**
   * The talk of the town.
   * _TODO_ understand why we need `| {}` below.
   */
  thunk: (param: ActionParam, args: ActArgs | {}) => ReturnValue;
  /**
   * Attached when the action is dispatched.
   */
  args: ActArgs;
}

interface ActionParam {
  state: RootState;
  dispatch: Dispatch;
}

/**
 * Generate a synchronous action {act} which can be dispatched,
 * and also the code {def} which the reducer will run.
 * The latter must be manually hooked into the reducer.
 */
export const generateSync = <ActKey extends string, Payload extends {}, State>(
  actKey: ActKey,
  actDef: (payload: Payload, state: State) => State
) => ({
  act: (payload: Payload) =>
    ({
      ...payload,
      key: "sync",
      type: actKey
    } as SyncAct<ActKey, Payload>),
  def: actDef
});

/**
 * Generate a thunk action, which can be dispatched.
 */
export const generateThunk = <ActKey extends string, ActArgs extends {}, ReturnValue>(
  actKey: ActKey,
  thunk: ThunkAct<ActKey, ActArgs, ReturnValue>["thunk"]
) => (args: ActArgs) =>
    ({
      key: "thunk",
      type: actKey,
      thunk,
      args
    } as ThunkAct<ActKey, ActArgs, ReturnValue>);

type ThunkMiddleware =
  // (service: Service) => (
  () => (opts: MiddlewareAPI<Dispatch>) => (next: Dispatch) => (action: RootAction) => any;

/**
 * Without this middleware one could only dispatch SyncActions.
 * We additionally permit ThunkActions.
 */
export const thunkMiddleware: ThunkMiddleware = () => ({ getState, dispatch }) => (
  next: Dispatch
) => (action: RootAction) => {
  if ("key" in action) {
    switch (action.key) {
      case "sync":
        return next(action);
      case "thunk": {
        return action.thunk({ state: getState(), dispatch }, action.args);
      }
    }
  }
  // Forward non-conforming actions e.g. from router.
  next(action as any);
};

/**
 * Add an item to a lookup.
 */
export function addToLookup<LookupItem extends { key: string }>(
  newItem: LookupItem,
  lookupState: KeyedLookup<string, LookupItem>
): KeyedLookup<string, LookupItem> {
  return { ...lookupState, [newItem.key]: newItem };
}

/**
 * Remove an item from a lookup.
 */
export function removeFromLookup<LookupItem extends { key: string }>(
  itemKey: string,
  lookupState: KeyedLookup<string, LookupItem>
): KeyedLookup<string, LookupItem> {
  const shallowCopy = { ...lookupState };
  delete shallowCopy[itemKey];
  return shallowCopy;
}

export type ReduxUpdater<LookupItem extends { key: Key }, Key extends string | number = string> = (
  item: LookupItem
) => Partial<LookupItem>;

/**
 * Update an existing item in a lookup.
 */
export function updateLookup<LookupItem extends { key: Key }, Key extends string | number = string>(
  itemKey: Key,
  lookupState: KeyedLookup<Key, LookupItem>,
  /**
   * The updater where item.key === itemKey.
   * If returns falsy, the state will not be updated.
   */
  toUpdates: ReduxUpdater<LookupItem, Key>
): KeyedLookup<Key, LookupItem> {
  const itemBeforeUpdate = lookupState[itemKey];

  if (!itemBeforeUpdate) {
    return lookupState; // Ignore if not found.
  } // Otherwise, compute updates.
  const updates = toUpdates(itemBeforeUpdate);
  if (!updates) {
    return lookupState; // falsy means don't update
  }

  return {
    ...lookupState,
    [itemKey]: {
      ...itemBeforeUpdate,
      ...updates
    }
  };
}