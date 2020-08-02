// Used by @store/test.duck.ts and monaco-editor at runtime.

 export interface State {
  count: number;
  lastPing: null | string;
 }

/**
 * Must keep in sync with `Act` from @store/test.duck.
 * Used by `useDispatch` at runtime.
 */
 export type DispatchableSync = (
  | { type: '[test] ping'; pay: {} }
  | { type: '[test] increment'; pay: {} }
  | { type: '[test] decrement'; pay: {} }
  | { type: '[test] set count'; pay: { count: number } }
 );

/**
 * Must keep in sync with `Thunk` from @store/test.duck.
 * Used by `useDispatch` at runtime.
 */
export type DispatchableThunk = never;
