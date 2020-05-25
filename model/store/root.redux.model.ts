import { SyncAct } from './redux.model';
import { RootState, RootAction } from '@store/reducer';

export interface DispatchOverload {
  <ActKey extends string = string, Payload = any>(action: SyncAct<ActKey, Payload>): void;
  <ActKey extends string = string, ReturnValue = any>(action: ThunkAct<ActKey, any, ReturnValue>): ReturnValue;
}

export interface RootThunkParams {
  dispatch: <T extends RootAction | ThunkAct<string, any, any>>(arg: T) => ThunkActReturnType<T>;
  getState: () => RootState;
  state: RootState;
}

export interface ThunkAct<T extends string, A extends {}, R> {
  type: T;
  thunk: (params: RootThunkParams, args: A) => R;
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

export interface DispatchOverload {
  <ActKey extends string = string, Payload = any>(action: SyncAct<ActKey, Payload>): void;
  <ActKey extends string = string, ReturnValue = any>(action: ThunkAct<ActKey, any, ReturnValue>): ReturnValue;
}
