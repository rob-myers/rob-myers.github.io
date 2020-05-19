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

export interface RootState {
  test: TestState;
  worker: WorkerState;
  gitalk: GitalkState;
}

export type RootAction = (
  | TestAction
  | WorkerAction
  | GitalkAction
);

export type RootThunk = (
  | WorkerThunk
  | GitalkThunk
);

const rootReducer = combineReducers<RootState>({
  test: testReducer,
  worker: workerReducer,
  gitalk: gitalkReducer,
});

export default rootReducer;
