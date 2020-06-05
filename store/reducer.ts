import { combineReducers } from 'redux';
import {
  reducer as testReducer,
  State as TestState, 
  Action as TestAction,
} from './test.duck';
import {
  reducer as workerReducer,
  State as WorkerState, 
  Action as WorkerAction,
  Thunk as WorkerThunk,
} from './worker.duck';
import {
  reducer as gitalkReducer,
  State as GitalkState, 
  Action as GitalkAction,
  Thunk as GitalkThunk,
} from './gitalk.duck';
import {
  reducer as layoutReducer,
  State as LayoutState, 
  Action as LayoutAction,
  Thunk as LayoutThunk,
} from './layout.duck';

export interface RootState {
  test: TestState;
  worker: WorkerState;
  gitalk: GitalkState;
  layout: LayoutState;
}

export type RootAction = (
  | TestAction
  | WorkerAction
  | GitalkAction
  | LayoutAction
);

export type RootThunk = (
  | WorkerThunk
  | GitalkThunk
  | LayoutThunk
);

const rootReducer = combineReducers<RootState>({
  test: testReducer,
  worker: workerReducer,
  gitalk: gitalkReducer,
  layout: layoutReducer,
});

export default rootReducer;
