/**
 * Actual projects are those subdirectories of `public/packages/`
 * containing `app.tsx` and also `reducer.ts` i.e. the root reducer.
 * We mock the latter because it is needed by the `shared` package.
 * If desired, we could include all reducers from all projects,
 * ensuring their global 'consistency' via typescript in development.
 */
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