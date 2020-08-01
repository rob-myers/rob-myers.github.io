type DistributiveOmit<T, K extends keyof T> = T extends unknown
  ? Omit<T, K>
  : never;

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
  type RootAct = (
    | BipartiteSync
    | TestSync
  )

  /** @internal */
  type RootThunk = (
    | BipartiteThunk
    | TestThunk
  )

  /** @internal */
  type Dispatchable = (
    | RootAct
    | DistributiveOmit<RootThunk, 'returns'>
  )

  export function useSelector<T = any>(
      selector: (state: RootState) => T,
      equalityFn?: Function,
    ): T;

  export function useDispatch(): <T extends Dispatchable>(arg: T) =>
    T['type'] extends RootThunk['type']
      ? Extract<RootThunk, { type: T['type'] }>['returns']
      : void;

}
