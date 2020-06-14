import { combineEpics } from 'redux-observable';
import { map, filter, flatMap } from 'rxjs/operators';
import { createAct, ActionsUnion, addToLookup, removeFromLookup, updateLookup } from '@model/store/redux.model';
import { KeyedLookup, testNever } from '@model/generic.model';
import { createThunk, createEpic } from '@model/store/root.redux.model';
import { filterActs } from './reducer';
import { exampleTsx3, exampleScss1 } from '@model/code/examples';

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

export const Act = {
  createFile: (input: { filename: string; contents: string }) =>
    createAct('[dev-env] create file', input),
  deleteFile: (input: { filename: string }) =>
    createAct('[dev-env] remove file', input),
  updateFile: (filename: string, updates: Partial<FileState>) =>
    createAct('[dev-env] update file', { filename, updates }),
  filePanelCreated: (input: { panelKey: string; filename: string }) =>
    createAct('[dev-env] file panel created', input),
  filePanelClosed: (input: { panelKey: string }) =>
    createAct('[dev-env] file panel closed', input),
};

export type Action = ActionsUnion<typeof Act>;

export const Thunk = {
  initFilesystem: createThunk(
    '[dev-env] init filesystem',
    ({ dispatch, state: { devEnv } }) => {
      // TODO only when files n'exist pas
      !devEnv.file['index.tsx']?.contents &&
        dispatch(Act.createFile({ filename: 'index.tsx', contents: exampleTsx3 }));
      !devEnv.file['index.scss']?.contents &&
        dispatch(Act.createFile({ filename: 'index.scss', contents: exampleScss1 }));
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
    case '[dev-env] file panel created': return { ...state,
      panelToFile: { ...state.panelToFile, [act.pay.panelKey]: act.pay.filename },
    };
    case '[dev-env] file panel closed': {
      const { [act.pay.panelKey]: _, ...panelToFile } = state.panelToFile;
      return { ...state, panelToFile };
    }
    default: return state || testNever(act);
  }
};

const togglePanelMenuEpic = createEpic(
  (action$, _state$) => action$.pipe(
    filterActs('[layout] clicked panel title'),
    map(({ args: { panelKey } }) => {
      console.log({ detectedTitleClick: panelKey });
      return { type: 'fake' } as any; // TODO
    }),
  ),
);

const trackFilesInPanels = createEpic(
  (action$, state$) => action$.pipe(
    filterActs('[layout] panel created', '[layout] panel closed'),
    filter((act) => act.type === '[layout] panel created'
      ? !!act.pay.panelMeta.filename
      : true),
    flatMap((act) => {
      const { panelKey } = act.pay;
      
      if (act.type === '[layout] panel created') {
        const { file } = state$.value.devEnv;
        const filename = act.pay.panelMeta.filename!;
        return [
          Act.filePanelCreated({ filename, panelKey }),
          ...(file[filename] ? [] : [Act.createFile({ filename, contents: '' })]),
        ];
      }
      return [Act.filePanelClosed({ panelKey })];
    }),
  ),
);

const loadFilesIntoMonacoModels = createEpic(
  (action$, state$) => action$.pipe(
    filterActs('[editor] store monaco model'),
    flatMap(({ pay: { model, filename } }) => {
      const { file } = state$.value.devEnv;
      if (file[filename]) {
        model.setValue(file[filename].contents);
      } else {
        console.warn(`Ignored untracked monaco model file "${filename}"`);
      }
      return [];
    }),
  ),
);

export const epic = combineEpics(
  loadFilesIntoMonacoModels,
  togglePanelMenuEpic,
  trackFilesInPanels,
);
