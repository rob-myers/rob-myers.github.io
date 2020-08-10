import { combineReducers } from 'redux';
import { combineEpics } from 'redux-observable';
import { filter } from 'rxjs/operators';

import { DistributiveOmit } from '@model/generic.model';

import {
  reducer as bipartiteReducer,
  State as BipartiteState, 
  Action as BipartiteAction,
  Thunk as BipartiteThunk,
} from './bipartite.duck';
import {
  reducer as blogReducer,
  State as BlogState, 
  Action as BlogAction,
  Thunk as BlogThunk,
} from './blog.duck';
import {
  reducer as geomReducer,
  State as GeomState, 
  Action as GeomAction,
  Thunk as GeomThunk,
} from './geom.duck';
import {
  reducer as testReducer,
  State as TestState, 
  Action as TestAction,
} from './test.duck';

export interface RootState {
  bipartite: BipartiteState;
  blog: BlogState;
  geom: GeomState;
  test: TestState;
}

export type RootAction = (
  | BipartiteAction
  | BlogAction
  | GeomAction
  | TestAction
);

export type RootThunk = (
  | BipartiteThunk
  | BlogThunk
  | GeomThunk
);

export const getRootThunks = () => [
  ...Object.values(BipartiteThunk),
  ...Object.values(BlogThunk),
  ...Object.values(GeomThunk),
];

export type Dispatchable = (
  | RootAction
  | DistributiveOmit<RootThunk, 'thunk'>
)

const createRootReducer = () => combineReducers<RootState>({
  bipartite: bipartiteReducer as any,
  blog: blogReducer,
  geom: geomReducer as any,
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
  // someEpic,
);

