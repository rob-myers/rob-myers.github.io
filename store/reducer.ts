import { combineReducers } from 'redux';
import {
  reducer as testReducer,
  State as TestState, 
  Action as TestAction,
} from './test.duck';
import {
  reducer as navReducer,
  State as NavState, 
  Action as NavAction,
  Thunk as NavThunk,
} from './nav.duck';

export interface RootState {
  test: TestState;
  nav: NavState;
}

export type RootAction = (
  | TestAction
  | NavAction
);

export type RootThunk = (
  | NavThunk
);

const rootReducer = combineReducers<RootState>({
  test: testReducer,
  nav: navReducer,
});

export default rootReducer;
