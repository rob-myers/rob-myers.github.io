import { Dispatch } from "@model/redux.model";
import { RootState } from "@store/reducer";

/**
 * Add missing typings for react hooks.
 * Advantage: can specify our RootState and Dispatch.
 */
declare module "react-redux" {
  function useSelector<T = any>(selector: (state: RootState) => T, equalityFn?: Function): T;

  function useDispatch(): Dispatch;
  // function useDispatch(): (act: RootAction) => void;

  function shallowEqual(): any;
}