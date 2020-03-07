import { combineReducers } from 'redux';
import {
  State as OsState, 
  Action as OsAction,
  Thunk as OsThunk,
  reducer as osReducer,
} from '@store/os/os.duck';

export interface OsWorkerState {
  os: OsState;
}

export type OsWorkerAction = (
  | OsAction
);

export type OsWorkerThunk = (
  | OsThunk
);

const rootReducer = combineReducers<OsWorkerState>({
  os: osReducer,
});

export default rootReducer;
