
declare module 'react-redux' {
  import { Component } from 'react';
  import { Store } from 'redux';
  import { RootState, Dispatchable, ThunkAction } from '@store/reducer';
  
  export interface ProviderProps<A extends Action = AnyAction> {
    /**
     * The single Redux store in your application.
     */
    store: Store<any, A>;
    /**
     * Optional context to be used internally in react-redux. Use React.createContext() to create a context to be used.
     * If this is used, generate own connect HOC by using connectAdvanced, supplying the same context provided to the
     * Provider. Initial value doesn't matter, as it is overwritten with the internal state of Provider.
     */
    context?: Context<ReactReduxContextValue>;
  }

  export class Provider<A extends Action = AnyAction> extends Component<ProviderProps<A>> { }

  function useSelector<T = any>(
    selector: (state: RootState) => T,
    equalityFn?: Function,
  ): T;
  
  function useDispatch(): <T extends Dispatchable>(arg: T) =>
    T['type'] extends ThunkAction['type']
      ? ReturnType<Extract<ThunkAction, { type: T['type'] }>['thunk']>
      : void;
}
