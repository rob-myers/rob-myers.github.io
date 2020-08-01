declare module 'react-redux' {
  
  import {
    State as BipartiteState,
    DispatchableSync as BipartiteSync,
    DispatchableThunk as BipartiteThunk,
  } from '@reducer/bipartite.types';

  import {
    State as TestState,
    DispatchableSync as TestSync,
    DispatchableThunk as TestThunk,
  } from '@reducer/test.types';

  /** @internal */
  interface RootState {
    bipartite: BipartiteState;
    test: TestState;
  }

  /** @internal */
  type Dispatchable = (
    | BipartiteSync
    | BipartiteThunk
    | TestSync
    | TestThunk
  )

  export function useSelector<T = any>(
    selector: (state: RootState) => T,
    equalityFn?: Function
  ): T;

  export function useDispatch(): <T extends Dispatchable>(arg: T) =>
    T extends { returns: any } ? T['returns'] : void;

}
