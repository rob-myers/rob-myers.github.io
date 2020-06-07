import { combineReducers } from 'redux';
import { combineEpics } from 'redux-observable';
import { epic as workerEpic } from './editor.duck';

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
import { filter } from 'rxjs/operators';

export interface RootState {
  test: TestState;
  editor: EditorState;
  gitalk: GitalkState;
  layout: LayoutState;
}

export type RootAction = (
  | TestAction
  | EditorAction
  | GitalkAction
  | LayoutAction
);

export type RootThunk = (
  | EditorThunk
  | GitalkThunk
  | LayoutThunk
);

const rootReducer = combineReducers<RootState>({
  test: testReducer,
  editor: editorReducer,
  gitalk: gitalkReducer,
  layout: layoutReducer,
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

export const rootEpic = combineEpics(
  workerEpic,
);
//#endregion