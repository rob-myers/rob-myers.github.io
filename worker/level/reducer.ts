import { combineReducers } from 'redux';
import {
  State as LevelsState, 
  Action as LevelAction,
  // Thunk as LevelThunk,
  reducer as levelReducer,
} from '@worker/level/level.duck';

export interface LevelWorkerState {
  level: LevelsState;
}

export type LevelWorkerAction = (
  | LevelAction
);

export type LevelWorkerThunk = (
  // | LevelThunk
  | never
);

export default combineReducers<LevelWorkerState>({
  level: levelReducer,
});
