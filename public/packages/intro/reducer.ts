import { combineReducers } from 'redux';

import {
  reducer as testReducer,
  State as TestState, 
  Action as TestAction,
  Thunk as TestThunk,
} from './test.duck';

export interface RootState {
  test: TestState;
}

export type RootAction = (
  | TestAction
);

export type ThunkAction = (
  | TestThunk
);

/** Provides thunks to our thunk middleware */
export const Thunk = {
  ...TestThunk,
};

export type Dispatchable = (
  | RootAction
  | Omit<ThunkAction, 'thunk'>
)

const createRootReducer = () => combineReducers({
  test: testReducer,
  // ...
});

/** Defines initial state and synchronous actions */
export default createRootReducer;
