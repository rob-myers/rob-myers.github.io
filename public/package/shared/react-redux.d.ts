declare module 'react-redux' {
  import { RootState, Dispatchable, ThunkAction } from '@reducer';

  function useSelector<T = any>(selector: (state: RootState) => T, equalityFn?: Function): T;
  function useDispatch(): <T extends Dispatchable>(arg: T) =>
    T['type'] extends ThunkAction['type']
      ? ReturnType<Extract<ThunkAction, { type: T['type'] }>['thunk']>
      : void;
}
