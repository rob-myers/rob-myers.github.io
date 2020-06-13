import { createAct, ActionsUnion, addToLookup, removeFromLookup, updateLookup } from '@model/store/redux.model';
import { KeyedLookup, testNever } from '@model/generic.model';
import { createThunk } from '@model/store/root.redux.model';

export interface State {
  file: KeyedLookup<FileState>;
  panelToFile: { [panelKey: string]: string };
}

interface FileState {
  /** Filename */
  key: string;
  /** Debounced value (doesn't drive editor) */
  contents: string;
}

const initialState: State = {
  file: {},
  panelToFile: {},
};

export const Action = {
  createFile: (input: { filename: string; contents: string }) =>
    createAct('[dev-env] create file', input),
  deleteFile: (input: { filename: string }) =>
    createAct('[dev-env] remove file', input),
  updateFile: (filename: string, updates: Partial<FileState>) =>
    createAct('[dev-env] update file', { filename, updates }),
};

export type Action = ActionsUnion<typeof Action>;

export const Thunk = {
  initFilesystem: createThunk(
    '[dev-env] init filesystem',
    () => {
      // TODO
    },
  ),
  /** Bootstrap an instance of the app */
  bootstrapApp: createThunk(
    '[dev-env] bootstrap app',
    (_, __) => {
      // TODO
    }),
  unmountApp: createThunk(
    '[dev-env] unmount app',
    () => {
      // TODO
    },
  ),
};

export type Thunk = ActionsUnion<typeof Thunk>;

export const reducer = (state = initialState, act: Action): State => {
  switch (act.type) {
    case '[dev-env] create file':
      return { ...state,
        file: addToLookup({
          key: act.pay.filename,
          contents: act.pay.contents,
        }, state.file),
      };
    case '[dev-env] remove file':
      return { ...state,
        file: removeFromLookup(act.pay.filename, state.file),
      };
    case '[dev-env] update file':
      return { ...state,
        file: updateLookup(act.pay.filename, state.file, () => act.pay.updates),
      };
    default: return state || testNever(act);
  }
};
