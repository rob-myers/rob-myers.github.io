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
  nav: NavState;
  xterm: XTermState;
  level: LevelState;
}

export type RootAction = (
  | TestAction
  | NavAction
  | XTermAction
  | LevelAction
);

export type RootThunk = (
  | NavThunk
  | LevelThunk
);

const rootReducer = combineReducers<RootState>({
  test: testReducer,
  nav: navReducer,
  xterm: xtermReducer,
  level: levelReducer,
});

export default rootReducer;
