import { combineReducers } from 'redux';
import { combineEpics } from 'redux-observable';
import { filter } from 'rxjs/operators';

import { DistributiveOmit } from '@model/generic.model';

import {
  reducer as blogReducer,
  State as BlogState, 
  Action as BlogAction,
  Thunk as BlogThunk,
  epic as blogEpic,
} from './blog.duck';
import {
  reducer as envReducer,
  State as EnvState, 
  Action as EnvAction,
  Thunk as EnvThunk,
} from './env.duck';
import {
  reducer as geomReducer,
  State as GeomState, 
  Action as GeomAction,
  Thunk as GeomThunk,
} from './geom.duck';
import {
  reducer as shellReducer,
  State as ShellState, 
  Action as ShellAction,
  Thunk as ShellThunk,
} from './shell.duck';
import {
  reducer as testReducer,
  State as TestState, 
  Action as TestAction,
} from './test.duck';

export interface RootState {
  blog: BlogState;
  env: EnvState;
  geom: GeomState;
  shell: ShellState;
  test: TestState;
}

export type RootAction = (
  | BlogAction
  | EnvAction
  | GeomAction
  | ShellAction
  | TestAction
);

export type RootThunk = (
  | BlogThunk
  | EnvThunk
  | GeomThunk
  | ShellThunk
);

export const getRootThunks = () => [
  ...Object.values(BlogThunk),
  ...Object.values(EnvThunk),
  ...Object.values(GeomThunk),
  ...Object.values(ShellThunk),
];

export type Dispatchable = (
  | RootAction
  | DistributiveOmit<RootThunk, 'thunk'>
)

const createRootReducer = () => combineReducers<RootState>({
  blog: blogReducer,
  env: envReducer,
  geom: geomReducer,
  shell: shellReducer as any,
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

export const createRootEpic = () => combineEpics(
  blogEpic,
);
