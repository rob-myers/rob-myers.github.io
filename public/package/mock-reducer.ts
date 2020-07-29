/**
 * Actual projects are those subdirectories of `public/package/`
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
} from '@package/intro/test.duck';

import {
  reducer as bipartiteReducer,
  State as BipartiteState, 
  Action as BipartiteAction,
  Thunk as BipartiteThunk,
} from '@package/bipartite/bipartite.duck';

export interface RootState {
  test: TestState;
  bipartite: BipartiteState;
}

export type RootAction = (
  | TestAction
  | BipartiteAction
);

export type ThunkAction = (
  | TestThunk
  | BipartiteThunk
);

/** Provides thunks to our thunk middleware */
export const Thunk = {
  ...TestThunk,
  ...BipartiteThunk,
};

export type Dispatchable = (
  | RootAction
  | Omit<ThunkAction, 'thunk'>
)

const createRootReducer = () => combineReducers({
  test: testReducer,
  bipartite: bipartiteReducer as any,
});

/** Defines initial state and synchronous actions */
export default createRootReducer;
