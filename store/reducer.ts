import { combineReducers } from 'redux';
import { combineEpics } from 'redux-observable';
import { filter } from 'rxjs/operators';

import {
  reducer as testReducer,
  State as TestState, 
  Action as TestAction,
} from './test.duck';
import {
  reducer as editorReducer,
  State as EditorState, 
  Action as EditorAction,
  Thunk as EditorThunk,
  epic as editorEpic,
} from './editor.duck';
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
import {
  reducer as devEnvReducer,
  State as DevEnvState, 
  Action as DevEnvAction,
  Thunk as DevEnvThunk,
  epic as devEnvEpic,
} from './dev-env.duck';

export interface RootState {
  test: TestState;
  editor: EditorState;
  gitalk: GitalkState;
  layout: LayoutState;
  devEnv: DevEnvState;
}

export type RootAction = (
  | TestAction
  | EditorAction
  | GitalkAction
  | LayoutAction
  | DevEnvAction
);

export type RootThunk = (
  | EditorThunk
  | GitalkThunk
  | LayoutThunk
  | DevEnvThunk
);

const rootReducer = () => combineReducers<RootState>({
  test: testReducer,
  editor: editorReducer,
  gitalk: gitalkReducer,
  layout: layoutReducer,
  devEnv: devEnvReducer,
});

export default rootReducer;

//#region redux-observable
export type RootActOrThunk = RootAction | RootThunk

export type GetActOrThunk<T extends RootActOrThunk['type']> =
Extract<RootActOrThunk, { type: T }>;

/** Replacement for `ofType` which refines action type as expected. */
export const filterAct = <T extends RootActOrThunk['type']>(type: T) =>
  filter((action: RootActOrThunk): action is GetActOrThunk<T> =>
    action.type === type);

export const filterActs = <T extends RootActOrThunk['type']>(...types: T[]) =>
  filter((action: RootActOrThunk): action is GetActOrThunk<T> =>
    types.includes(action.type as T));

export const rootEpic = () => combineEpics(
  editorEpic,
  devEnvEpic,
);
//#endregion