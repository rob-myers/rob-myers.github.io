import { SyncAct } from '@model/store/redux.model';
import { GeomWorkerAction, GeomWorkerState } from './reducer';
import { GeomWorkerContext } from './worker.model';

export interface GeomThunkParams {
  dispatch: <T extends GeomWorkerAction | GeomThunkAct<string, any, any>>(arg: T) => ThunkActReturnType<T>;
  getState: () => GeomWorkerState;
  state: GeomWorkerState;
  worker: GeomWorkerContext;
}

export interface GeomThunkAct<T extends string, A extends {}, R> {
  type: T;
  thunk: (params: GeomThunkParams, args: A) => R;
  args: A;
}

type ThunkActReturnType<T> = T extends GeomThunkAct<string, any, infer R> ? R : any;

/**
 * Depends on type of redux state inside this worker.
 */
export const createGeomThunk  = <
  T extends string,
  Act extends GeomThunkAct<T, Act['args'], R>,
  R = void
>(type: T, thunk: Act['thunk']) => (args: Act['args']) =>
  ({
    type,
    thunk,
    args
  } as Act);

export interface GeomDispatchOverload {
  <ActKey extends string = string, Payload = any>(action: SyncAct<ActKey, Payload>): void;
  <ActKey extends string = string, ReturnValue = any>(action: GeomThunkAct<ActKey, any, ReturnValue>): ReturnValue;
}
