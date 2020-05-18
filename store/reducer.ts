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
import {
  reducer as gitalkReducer,
  State as GitalkState, 
  Action as GitalkAction,
  Thunk as GitalkThunk,
} from './gitalk.duck';

export interface RootState {
  test: TestState;
  global: GlobalState;
  gitalk: GitalkState;
}

export type RootAction = (
  | TestAction
  | GlobalAction
  | GitalkAction
);

export type RootThunk = (
  | GlobalThunk
  | GitalkThunk
);

const rootReducer = combineReducers<RootState>({
  test: testReducer,
  global: globalReducer,
  gitalk: gitalkReducer,
});

export default rootReducer;
