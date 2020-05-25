import { SyncAct } from '@model/store/redux.model';
import { SyntaxWorkerAction, SyntaxWorkerState } from './reducer';
import { SyntaxWorkerContext } from './worker.model';

export interface SyntaxThunkParams {
  dispatch: <T extends SyntaxWorkerAction | SyntaxThunkAct<string, any, any>>(arg: T) => ThunkActReturnType<T>;
  getState: () => SyntaxWorkerState;
  state: SyntaxWorkerState;
  worker: SyntaxWorkerContext;
}

export interface SyntaxThunkAct<T extends string, A extends {}, R> {
  type: T;
  thunk: (params: SyntaxThunkParams, args: A) => R;
  args: A;
}

type ThunkActReturnType<T> = T extends SyntaxThunkAct<string, any, infer R> ? R : any;

/**
 * Depends on type of redux state inside this worker.
 */
export const createSyntaxThunk  = <
  T extends string,
  Act extends SyntaxThunkAct<T, Act['args'], R>,
  R = void
>(type: T, thunk: Act['thunk']) => (args: Act['args']) =>
  ({
    type,
    thunk,
    args
  } as Act);

export interface SyntaxDispatchOverload {
  <ActKey extends string = string, Payload = any>(action: SyncAct<ActKey, Payload>): void;
  <ActKey extends string = string, ReturnValue = any>(action: SyntaxThunkAct<ActKey, any, ReturnValue>): ReturnValue;
}
