import { RootState, Dispatchable, ThunkAction } from '@reducer';

declare module 'react-redux' {
  function useSelector<T = any>(selector: (state: RootState) => T, equalityFn?: Function): T;
  function useDispatch(): <T extends Dispatchable>(arg: T) =>
    T['type'] extends ThunkAction['type']
      ? ReturnType<Extract<ThunkAction, { type: T['type'] }>['thunk']>
      : void;
}
