import { SyncAct } from '@model/redux.model';
import { LevelWorkerAction, LevelWorkerState } from '@worker/level/reducer';
import { LevelWorkerContext } from '@model/level/level.worker.model';

export function createLevelAct<
  T extends string,
  Act extends SyncAct<T, Act['pay']>
>(actKey: T) {
  return (pay: Act['pay']) => ({ type: actKey, pay }) as unknown as Act;
}

export type SyncActDef<
  ActKey extends string,
  Act extends SyncAct<ActKey, Act['pay']>,
  State
> = (payload: Act['pay'], state: State) => State;

export interface LevelThunkParams {
  dispatch: <T extends LevelWorkerAction | LevelThunkAct<string, any, any>>(arg: T) => ThunkActReturnType<T>;
  getState: () => LevelWorkerState;
  state: LevelWorkerState;
  worker: LevelWorkerContext;
}

export interface LevelThunkAct<T extends string, A extends {}, R> {
  type: T;
  thunk: (params: LevelThunkParams, args: A) => R;
  args: A;
}

type ThunkActReturnType<T> = T extends LevelThunkAct<string, any, infer R> ? R : any;

export const createLevelThunk  = <
  T extends string,
  Act extends LevelThunkAct<T, Act['args'], R>,
  R = void
>(type: T, thunk: Act['thunk']) => (args: Act['args']) =>
  ({
    type,
    thunk,
    args
  } as Act);

export interface LevelDispatchOverload {
  <ActKey extends string = string, Payload = any>(action: SyncAct<ActKey, Payload>): void;
  <ActKey extends string = string, ReturnValue = any>(action: LevelThunkAct<ActKey, any, ReturnValue>): ReturnValue;
}
