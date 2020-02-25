import {
  // reducer as osReducer,
  State as OsState, 
  Action as OsAction,
  Thunk as OsThunk,
} from '@store/os.duck';

export interface OsWorkerState {
  os: OsState;
}

export type OsWorkerAction = (
  | OsAction
);

export type OsWorkerThunk = (
  | OsThunk
);