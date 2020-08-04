declare module 'react-redux' {
  
  import '@reducer/bipartite.types';
  import '@reducer/test.types';
  import '@reducer/geom.types';

  namespace Bipartite {
    export * from '@reducer/bipartite.types';
  }
  namespace Geom {
    export * from '@reducer/geom.types';
  }
  namespace Test {
    export * from '@reducer/test.types';
  }

  /** @internal */
  interface RootState {
    bipartite: Bipartite.State;
    geom: Geom.State;
    test: Test.State;
  }

  /** @internal */
  type RootSync = (
    | Bipartite.DispatchableSync
    | Geom.DispatchableSync
    | Test.DispatchableSync
  )

  /** @internal */
  type RootThunk = (
    | Bipartite.DispatchableThunk
    | Geom.DispatchableThunk
    | Test.DispatchableThunk
  )

  /** @internal */
  type Dispatchable = (
    | RootSync
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

type DistributiveOmit<T, K extends keyof T> = T extends unknown
  ? Omit<T, K>
  : never;
