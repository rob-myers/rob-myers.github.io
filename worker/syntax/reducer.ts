import { combineReducers } from 'redux';
import {
  State as TestState, 
  Action as TestAction,
  // Thunk as TestThunk,
  reducer as testReducer,
} from '@worker/syntax/test.duck';

export interface SyntaxWorkerState {
  test: TestState;
}

export type SyntaxWorkerAction = (
  | TestAction
);

export type SyntaxWorkerThunk = (
  // | TestThunk
  | never
);

export default combineReducers<SyntaxWorkerState>({
  test: testReducer,
});
