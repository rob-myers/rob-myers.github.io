//#region sync
export const createSync = <T extends string, P extends object = {}>(
  type: T,
  payload: P
): SyncAct<T, P> => ({ type, payload });

export interface SyncAct<T extends string, Payload extends null | {}> {
  type: T;
  payload: Payload;
}
//#endregion

//#region thunk
import { RootState, RootAction } from '@reducer';

export interface RootThunkParams {
  dispatch: <T extends RootAction | ThunkAct<string, any, any>>(arg: T) => ThunkActReturnType<T>;
  getState: () => RootState;
  state: RootState;
}

export type ThunkActReturnType<T> = T extends ThunkAct<string, any, infer R> ? R : any;

export interface ThunkAct<T extends string, A extends {}, R> {
  type: T;
  thunk: (params: RootThunkParams, args: A) => R;
  args: A;
}

export const createThunk = <T extends string, A extends {} = {}, R = void>(
  type: T,
  thunk: ThunkAct<T, A, R>['thunk']
) => Object.assign((args: A) =>
  ({
    type,
    thunk,
    args
  } as ThunkAct<T, A, R>), { type });
//#endregion

interface ActionCreatorsMapObject {
  [actionCreator: string]: (...args: any[]) => any
}

export type ActionsUnion<A extends ActionCreatorsMapObject> =
  ReturnType<A[keyof A]>;