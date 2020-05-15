import { combineReducers } from 'redux';
import {
  reducer as testReducer,
  State as TestState, 
  Action as TestAction,
} from './test.duck';
import {
  reducer as globalReducer,
  State as GlobalState, 
  Action as GlobalAction,
  Thunk as GlobalThunk,
} from './global.duck';

export interface RootState {
  test: TestState;
  global: GlobalState;
}

export type RootAction = (
  | TestAction
  | GlobalAction
);

export type RootThunk = (
  | GlobalThunk
);

const rootReducer = combineReducers<RootState>({
  test: testReducer,
  global: globalReducer,
});

export default rootReducer;
