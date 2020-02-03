import { Dispatch } from 'redux';
import { RootAction, RootState } from './reducer';

interface Act<T extends string, P extends {}> {
  type: T;
  payload: P;
}

export const createAct = <T extends string, P = {}>(
  type: T,
  payload?: P
): Act<T, P> => ({
    type,
    payload: payload || {} as P,
  });

export interface ThunkParams {
  dispatch: Dispatch<RootAction>;
   getState: () => RootState;
}

export interface ThunkAct<T extends string, A extends {}, R> {
  type: T;
  thunk: (params: ThunkParams, args: A) => R;
  args: A;
}

export const createThunk = <T extends string, A extends {} = {}, R = void>(
  type: T,
  thunk: ThunkAct<T, A, R>['thunk']
) => (args: A) =>
    ({
      type,
      thunk,
      args
    } as ThunkAct<T, A, R>);
