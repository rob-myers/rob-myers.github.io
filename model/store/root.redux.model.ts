import { SyncAct } from './redux.model';
import { RootState, RootAction, RootActOrThunk } from '@store/reducer';
import { ActionsObservable, StateObservable } from 'redux-observable';
import { Observable } from 'rxjs';

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

export const createEpic = <T extends RootActOrThunk>(
  arg: (
    action$: ActionsObservable<RootActOrThunk>,
    _state$: StateObservable<RootState>,
  ) => Observable<T>
) => arg;
