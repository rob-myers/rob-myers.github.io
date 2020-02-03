import { combineReducers } from 'redux';
import testReducer from './test.duck';

export interface RootState {
  test: ReturnType<typeof testReducer>;
}

export type RootAction = (
  | Parameters<typeof testReducer>[1] 
);

const rootReducer = combineReducers<RootState>({
  test: testReducer,
});

export default rootReducer;
