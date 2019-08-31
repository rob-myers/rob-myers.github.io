import { combineReducers } from "redux";
import { History } from "history";

import { connectRouter, RouterState, RouterAction } from "connected-react-router";
// import { combineEpics, ActionsObservable, StateObservable } from "redux-observable";
// import { BehaviorSubject } from "rxjs";
// import { mergeMap } from "rxjs/operators";

import {
  reducer as testReducer,
  State as TestState,
  Action as TestAction,
  ThunkAction as TestThunkAction
} from "./test.duck";

// import {
//   reducer as topDownReducer,
//   State as TopDownState,
//   Action as TopDownAction,
//   ThunkAction as TopDownThunkAction
// } from "./top-down.duck";

export interface RootState {
  router: RouterState;
  test: TestState;
  // topDown: TopDownState;
}

export type RootSyncAction = RouterAction | TestAction;
// | TopDownAction;
export type RootThunkAction = TestThunkAction;
// | TopDownThunkAction;
export type RootAction = RootSyncAction | RootThunkAction;

export default (history: History) =>
  combineReducers<RootState>({
    router: connectRouter(history),
    test: testReducer
    // topDown: topDownReducer
  });

// const epic$ = new BehaviorSubject(combineEpics(osEpic));

// export const rootEpic = (
//   action$: ActionsObservable<RootAction>,
//   state$: StateObservable<RootState>
// ) => epic$.pipe(mergeMap(epic => epic(action$, state$, [])));
