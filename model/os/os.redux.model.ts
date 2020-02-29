import { SyncAct } from '../redux.model';
import { OsWorkerAction, OsWorkerState } from '@worker/os/reducer';
import { Service } from '@service/create-services';
import { OsWorkerContext } from './os.worker.model';

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

export interface OsThunkParams {
  dispatch: <T extends OsWorkerAction | OsThunkAct<string, any, any>>(arg: T) => ThunkActReturnType<T>;
  getState: () => OsWorkerState;
  state: OsWorkerState;
  service: Service;
  worker: OsWorkerContext;
}

export interface OsThunkAct<T extends string, A extends {}, R> {
  type: T;
  thunk: (params: OsThunkParams, args: A) => R;
  args: A;
}

type ThunkActReturnType<T> = T extends OsThunkAct<string, any, infer R> ? R : any;

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

export interface OsDispatchOverload {
    <ActKey extends string = string, Payload = any>(action: SyncAct<ActKey, Payload>): void;
    <ActKey extends string = string, ReturnValue = any>(action: OsThunkAct<ActKey, any, ReturnValue>): ReturnValue;
}
