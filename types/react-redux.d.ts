import { RootState } from '@store/reducer';
import { ThunkActReturnType } from '@model/root.redux.model';

declare module 'react-redux' {
  function useSelector<T = any>(selector: (state: RootState) => T, equalityFn?: Function): T;
  function useDispatch(): <T>(arg: T) => ThunkActReturnType<T>
}
