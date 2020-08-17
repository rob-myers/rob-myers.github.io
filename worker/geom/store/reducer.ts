import { combineReducers } from 'redux';
import {
  State as TestState, 
  Action as TestAction,
  // Thunk as TestThunk,
  reducer as testReducer,
} from '@worker/geom/store/test.duck';

export interface GeomWorkerState {
  test: TestState;
}

export type GeomWorkerAction = (
  | TestAction
);

export type GeomWorkerThunk = (
  // | TestThunk
  | never
);

export default combineReducers<GeomWorkerState>({
  test: testReducer,
});
