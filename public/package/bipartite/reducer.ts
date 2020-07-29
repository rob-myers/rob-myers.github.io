import { combineReducers } from 'redux';

import {
  State as DemoState,
  reducer as demoReducer,
  Action as DemoAction,
  Thunk as DemoThunk,
} from './bipartite.duck';

export interface RootState {
  demo: DemoState;
}

export type RootAction = (
  | DemoAction
);

export type ThunkAction = (
  | DemoThunk
);

export const Thunk = {
  ...DemoThunk,
};

export type Dispatchable = (
  | RootAction
  | Omit<ThunkAction, 'thunk'>
)

const createRootReducer = () => combineReducers<RootState, never>({
  demo: demoReducer,
});

export default createRootReducer;
