import { combineReducers } from 'redux';
import {
  reducer as testReducer,
  State as TestState, 
  Action as TestAction,
} from './test.duck';
import {
  reducer as xtermReducer,
  State as XTermState, 
  Action as XTermAction,
} from './xterm.duck';
import {
  reducer as levelReducer,
  State as LevelState, 
  Action as LevelAction,
  Thunk as LevelThunk,
} from './level.duck';

export interface RootState {
  test: TestState;
  xterm: XTermState;
  level: LevelState;
}

export type RootAction = (
  | TestAction
  | XTermAction
  | LevelAction
);

export type RootThunk = (
  | LevelThunk
);

const rootReducer = combineReducers<RootState>({
  test: testReducer,
  xterm: xtermReducer,
  level: levelReducer,
});

export default rootReducer;
