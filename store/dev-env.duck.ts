import { combineEpics } from 'redux-observable';
import { map, filter, flatMap } from 'rxjs/operators';
import { createAct, ActionsUnion, addToLookup, removeFromLookup, updateLookup, ReduxUpdater } from '@model/store/redux.model';
import { KeyedLookup, testNever } from '@model/generic.model';
import { createThunk, createEpic } from '@model/store/root.redux.model';
import { filterActs } from './reducer';
import { exampleTsx3, exampleScss1 } from '@model/code/examples';

import { Thunk as EditorThunk } from './editor.duck';
import { panelKeyToRootId } from '@components/dev-env/dev-env.model';

export interface State {
  file: KeyedLookup<FileState>;
  panelToFile: KeyedLookup<PanelFile>;
}

interface PanelFile {
  /** Panel key */
  key: string;
  filename: string;
  /** If a new file is stored in panel we'll need to cleanup */
  cleanups: (() => void)[];
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
  addFilePanelCleanups: (input: { panelKey: string; cleanups: (() => void)[] }) =>
    createAct('[dev-env] add file panel cleanups', input),
  createFile: (input: { filename: string; contents: string }) =>
    createAct('[dev-env] create file', input),
  deleteFile: (input: { filename: string }) =>
    createAct('[dev-env] remove file', input),
  filePanelClosed: (input: { panelKey: string }) =>
    createAct('[dev-env] file panel closed', input),
  filePanelCreated: (input: { panelKey: string; filename: string }) =>
    createAct('[dev-env] file panel created', input),
  updateFile: (filename: string, updates: Partial<FileState>) =>
    createAct('[dev-env] update file', { filename, updates }),
  updatePanelFileMeta: (panelKey: string, updates: ReduxUpdater<PanelFile>) =>
    createAct('[dev-env] update panel file meta', { panelKey, updates }),
};

export type Action = ActionsUnion<typeof Act>;

export const Thunk = {
  /** Bootstrap an instance of the app */
  bootstrapApp: createThunk(
    '[dev-env] bootstrap app instance',
    (_, { panelKey }: { panelKey: string }) => {
      const el = document.getElementById(panelKeyToRootId(panelKey));
      console.log({ mountAppAt: el });
      // TODO
    }),
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
  trackFileContents: createThunk(
    '[dev-env] track file contents',
    ({ dispatch, state: { devEnv } }, { editorKey, filename }: { editorKey: string; filename: string }) => {
      const found = Object.entries(devEnv.panelToFile).find(([_, { filename: f }]) => filename === f);
      if (found) {
        const [panelKey] = found;
        const act = (contents: string) => dispatch(Act.updateFile(filename, { contents }));
        const disposable = dispatch(EditorThunk.onModelChange({ do: act, debounceMs: 1000, editorKey }));
        dispatch(Act.addFilePanelCleanups({ panelKey, cleanups: [() => disposable.dispose()] }));
      } else {
        console.warn(`Ignored filename "${filename}" from editor "${editorKey}" (panel unknown)`);
      }
    },
  ),
  unmountApp: createThunk(
    '[dev-env] unmount app instance',
    (_, { panelKey }: { panelKey: string }) => {
      const el = document.getElementById(panelKeyToRootId(panelKey));
      console.log({ unmountAppAt: el });
      // TODO
    },
  ),
};

export type Thunk = ActionsUnion<typeof Thunk>;

export const reducer = (state = initialState, act: Action): State => {
  switch (act.type) {
    case '[dev-env] add file panel cleanups': return { ...state,
      panelToFile: updateLookup(act.pay.panelKey, state.panelToFile, ({ cleanups }) => ({
        cleanups: cleanups.concat(act.pay.cleanups),
      }))
    };
    case '[dev-env] create file': return { ...state,
      file: addToLookup({
        key: act.pay.filename,
        contents: act.pay.contents,
      }, state.file),
    };
    case '[dev-env] remove file': return { ...state,
      file: removeFromLookup(act.pay.filename, state.file),
    };
    case '[dev-env] file panel closed': return { ...state,
      panelToFile: removeFromLookup(act.pay.panelKey, state.panelToFile),
    };
    case '[dev-env] file panel created': return { ...state,
      panelToFile: addToLookup({
        key: act.pay.panelKey,
        filename: act.pay.filename,
        cleanups: [],
      }, state.panelToFile)
    };
    case '[dev-env] update file': return { ...state,
      file: updateLookup(act.pay.filename, state.file, () => act.pay.updates),
    };    
    case '[dev-env] update panel file meta': return { ...state,
      panelToFile: updateLookup(act.pay.panelKey, state.panelToFile, act.pay.updates),
    };    
    default: return state || testNever(act);
  }
};

const initializeFileSystem = createEpic(
  (action$, _state$) => action$.pipe(
    filterActs('persist/REHYDRATE' as any),
    map(() => Thunk.initFilesystem({})),
  ),
);

const trackFilePanelMeta = createEpic(
  (action$, state$) => action$.pipe(
    filterActs('[layout] panel created', '[layout] panel closed'),
    filter((act) => act.type === '[layout] panel created'
      ? !!act.pay.panelMeta.filename : true),
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

const trackFileContents = createEpic(
  (action$, state$) => action$.pipe(
    filterActs('[editor] store monaco model'),
    flatMap(({ pay: { model, filename, editorKey } }) => {
      const { file } = state$.value.devEnv;
      if (file[filename]) {
        model.setValue(file[filename].contents);
        return [Thunk.trackFileContents({ editorKey, filename })];
      } else {
        console.warn(`Ignored untracked filename "${filename}" of monaco model`);
      }
      return [];
    }),
  ),
);

const togglePanelMenuEpic = createEpic(
  (action$, _state$) => action$.pipe(
    filterActs('[layout] clicked panel title'),
    map(({ args: { panelKey } }) => {
      console.log({ detectedTitleClick: panelKey });
      return { type: 'fake' } as any; // TODO
    }),
  ),
);

export const epic = combineEpics(
  initializeFileSystem,
  trackFilePanelMeta,
  trackFileContents,
  togglePanelMenuEpic,
);
