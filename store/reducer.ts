import { combineReducers } from 'redux';
import { combineEpics } from 'redux-observable';
import { filter } from 'rxjs/operators';

import { DistributiveOmit } from '@model/generic.model';
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
  reducer as devEnvReducer,
  State as DevEnvState, 
  Action as DevEnvAction,
  Thunk as DevEnvThunk,
  epic as devEnvEpic,
} from './dev-env.duck';
import {
  reducer as bipartiteReducer,
  State as BipartiteState, 
  Action as BipartiteAction,
  Thunk as BipartiteThunk,
} from './bipartite.duck';

export interface RootState {
  bipartite: BipartiteState;
  devEnv: DevEnvState;
  editor: EditorState;
  test: TestState;
}

export type RootAction = (
  | BipartiteAction
  | DevEnvAction
  | EditorAction
  | TestAction
);

export type RootThunk = (
  | BipartiteThunk
  | DevEnvThunk
  | EditorThunk
);

export const getRootThunks = () => [
  ...Object.values(EditorThunk),
  ...Object.values(DevEnvThunk),
  ...Object.values(BipartiteThunk),
];

export type Dispatchable = (
  | RootAction
  | DistributiveOmit<RootThunk, 'thunk'>
)

const createRootReducer = () => combineReducers<RootState>({
  bipartite: bipartiteReducer as any,
  devEnv: devEnvReducer,
  editor: editorReducer,
  test: testReducer,
});

export default createRootReducer;

/**
 * Redux observable
 */
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
