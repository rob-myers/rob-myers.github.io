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

export interface RootState {
  test: TestState;
  nav: NavState;
  xterm: XTermState;
}

export type RootAction = (
  | TestAction
  | NavAction
  | XTermAction
);

export type RootThunk = (
  | NavThunk
);

const rootReducer = combineReducers<RootState>({
  test: testReducer,
  nav: navReducer,
  xterm: xtermReducer,
});

export default rootReducer;
