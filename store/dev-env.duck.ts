import { combineEpics } from 'redux-observable';
import { map, filter, flatMap } from 'rxjs/operators';
import { createAct, ActionsUnion, addToLookup, removeFromLookup, updateLookup, ReduxUpdater } from '@model/store/redux.model';
import { KeyedLookup, testNever } from '@model/generic.model';
import { createThunk, createEpic } from '@model/store/root.redux.model';
import { filterActs } from './reducer';
import { exampleTsx3, exampleScss1, exampleTs1 } from '@model/code/examples';

import { Thunk as EditorThunk } from './editor.duck';
import { Thunk as LayoutThunk } from './layout.duck';
import { panelKeyToAppElId, FileImportsMeta, FileExportsMeta } from '@components/dev-env/dev-env.model';

export interface State {
  file: KeyedLookup<FileState>;
  initialized: boolean;
  panelToApp: KeyedLookup<PanelApp>;
  panelToFile: KeyedLookup<PanelFile>;
  tsAndTsxValid: boolean;
}

interface PanelFile {
  /** Panel key */
  key: string;
  filename: string;
  /** If a new file is stored in panel we'll need to cleanup */
  cleanups: (() => void)[];
}
interface PanelApp {
  /** Panel key */
  key: string;
  elementId: string;
}

interface FileState {
  /** Filename */
  key: string;
  /** Debounced value (doesn't drive editor) */
  contents: string;
  ext: 'tsx' | 'ts' | 'scss';
  /** Last transpilation */
  transpiled: null | Transpilation;
}
type Transpilation = {
  src: string;
  dst: string;
  type: 'js' | 'css';
  /** e.g. remove previous typings (js only) */
  cleanups: (() => void)[];
}

const initialState: State = {
  file: {},
  initialized: false,
  panelToApp: {},
  panelToFile: {},
  tsAndTsxValid: false,
};

export const Act = {
  addPanelCleanups: (input: { panelKey: string; cleanups: (() => void)[] }) =>
    createAct('[dev-env] add panel cleanups', input),
  createFile: (input: { filename: string; contents: string }) =>
    createAct('[dev-env] create file', input),
  deleteFile: (input: { filename: string }) =>
    createAct('[dev-env] remove file', input),
  forgetFilePanel: (input: { panelKey: string }) =>
    createAct('[dev-env] forget file panel', input),
  forgetAppPanel: (input: { panelKey: string }) =>
    createAct('[dev-env] forget app panel', input),
  initialized: () =>
    createAct('[dev-env] initialized', {}),
  rememberAppPanel: (input: { panelKey: string }) =>
    createAct('[dev-env] remember app panel', input),
  rememberFilePanel: (input: { panelKey: string; filename: string }) =>
    createAct('[dev-env] remember file panel', input),
  setTsAndTsxValidity: (isValid: boolean) =>
    createAct('[dev-env] set ts/tsx validity', { isValid }),
  storeTranspilation: (filename: string, transpilation: Transpilation) =>
    createAct('[dev-env] store transpilation', { filename, transpilation }),
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
      const el = document.getElementById(panelKeyToAppElId(panelKey));
      /**
       * TODO
       */
      console.log({ mountAppAt: el });
    }),
  initialize: createThunk(
    '[dev-env] initialize',
    ({ dispatch, state: { devEnv } }) => {
      /**
       * TEMP provide demo files.
       */
      !devEnv.file['index.tsx']?.contents &&
        dispatch(Act.createFile({ filename: 'index.tsx', contents: exampleTsx3 }));
      !devEnv.file['model.ts']?.contents &&
        dispatch(Act.createFile({ filename: 'model.ts', contents: exampleTs1 }));
      !devEnv.file['index.scss']?.contents &&
        dispatch(Act.createFile({ filename: 'index.scss', contents: exampleScss1 }));
      dispatch(Act.initialized());
    },
  ),
  filenameToPanelKey: createThunk(
    '[dev-env] filename to panel key',
    ({ state: { devEnv } }, { filename }: { filename: string }) =>
      Object.entries(devEnv.panelToFile)
        .find(([_, { filename: f }]) => filename === f)?.[0] || null
  ),
  setupFileUpdateTranspile: createThunk(
    '[dev-env] setup file update/transpile',
    ({ dispatch }, { editorKey, filename, modelKey }: {
      editorKey: string;
      filename: string;
      modelKey: string;
    }) => {
      const panelKey = dispatch(Thunk.filenameToPanelKey({ filename }))!;
      const updateCode = (contents: string) => dispatch(Act.updateFile(filename, { contents }));
      const dA = dispatch(EditorThunk.trackModelChange({ do: updateCode, debounceMs: 500, editorKey }));

      const transpileCode = () => dispatch(Thunk.tryTranspileModel({ filename, modelKey }));
      const dB = dispatch(EditorThunk.trackModelChange({ do: transpileCode, debounceMs: 500, editorKey }));
      transpileCode(); // Initial transpile

      dispatch(Act.addPanelCleanups({ panelKey, cleanups: [() => dA.dispose(), () => dB.dispose()] }));
    },
  ),
  tryTranspileModel: createThunk(
    '[dev-env] try transpile model',
    async ({ dispatch }, { filename, modelKey }: {
      filename: string;
      modelKey: string;
    }) => {
      const transpiled = await dispatch(EditorThunk.transpileModel({ modelKey }));
      if (transpiled?.key === 'success') {
        const { imports, exports } = await dispatch(EditorThunk.computeImportExports({
          filename,
          code: transpiled.transpiledJs,
        }));
        if (dispatch(Thunk.tryUpdateDependencyGraph({ filename, imports, exports }))) {
          const patchedJs = dispatch(EditorThunk.patchTranspiledImports({ js: transpiled.transpiledJs }));
          console.log({ transpiled: patchedJs });
          dispatch(Thunk.updateTranspilation({
            filename,
            src: transpiled.src,
            dst: patchedJs,
            typings: transpiled.typings,
          }));
        }
      }
    },
  ),
  /**
   * TODO
   * - maintain implicit DAG
   * - cycles not permitted because we use blob urls
   */
  tryUpdateDependencyGraph: createThunk(
    '[dev-env] try update dependency graph',
    (_, { filename, exports, imports }: {
      filename: string;
      imports: FileImportsMeta;
      exports: FileExportsMeta;
    }) => {
      console.log({ filename, exports, imports });
      return true;
    },
  ),
  unmountApp: createThunk(
    '[dev-env] unmount app instance',
    (_, { panelKey }: { panelKey: string }) => {
      const el = document.getElementById(panelKeyToAppElId(panelKey));
      /**
       * TODO
       */
      console.log({ unmountAppAt: el });
    },
  ),
  updateTranspilation: createThunk(
    '[dev-env] update transpilation',
    ({ dispatch, state: { devEnv } }, { filename, src, dst, typings }: {
      filename: string;
      src: string;
      dst: string;
      typings: string;
    }) => {
      devEnv.file[filename]?.transpiled?.cleanups.forEach(cleanup => cleanup());
      const typesFilename = filename.replace(/\.tsx?$/, '.d.ts');
      const disposable = dispatch(EditorThunk.addTypings({ filename: typesFilename, typings }));
      const cleanups = [() => disposable.dispose()];
      dispatch(Act.storeTranspilation(filename, { src, dst, type: 'js', cleanups }));
    },
  ),
};

export type Thunk = ActionsUnion<typeof Thunk>;

export const reducer = (state = initialState, act: Action): State => {
  switch (act.type) {
    case '[dev-env] add panel cleanups': return { ...state,
      panelToFile: updateLookup(act.pay.panelKey, state.panelToFile, ({ cleanups }) => ({
        cleanups: cleanups.concat(act.pay.cleanups),
      })),
    };
    case '[dev-env] create file': return { ...state,
      file: addToLookup({
        key: act.pay.filename,
        contents: act.pay.contents,
        ext: act.pay.filename.split('.').pop() as any,
        transpiled: null,
      }, state.file),
    };
    case '[dev-env] remove file': return { ...state,
      file: removeFromLookup(act.pay.filename, state.file),
    };
    case '[dev-env] forget file panel': return { ...state,
      panelToFile: removeFromLookup(act.pay.panelKey, state.panelToFile),
    };
    case '[dev-env] forget app panel': return { ...state,
      panelToApp: removeFromLookup(act.pay.panelKey, state.panelToApp),
    };
    case '[dev-env] initialized': return { ...state,
      initialized: true,
    };
    case '[dev-env] remember app panel': return { ...state,
      panelToApp: addToLookup({
        key: act.pay.panelKey,
        elementId: panelKeyToAppElId(act.pay.panelKey),
      }, state.panelToApp),
    };
    case '[dev-env] remember file panel': return { ...state,
      panelToFile: addToLookup({
        key: act.pay.panelKey,
        filename: act.pay.filename,
        cleanups: [],
      }, state.panelToFile)
    };
    case '[dev-env] set ts/tsx validity': return { ...state,
      tsAndTsxValid: act.pay.isValid,
    };
    case '[dev-env] store transpilation': return { ...state,
      file: updateLookup(act.pay.filename, state.file, () => ({
        transpiled: act.pay.transpilation,
      })),
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

const bootstrapAppInstances = createEpic(
  (action$, state$) => action$.pipe(
    filterActs(
      '[dev-env] store transpilation',
      '[dev-env] remember app panel',
      '[dev-env] forget app panel',
    ),
    flatMap((act) => {
      const { file, panelToApp, tsAndTsxValid } = state$.value.devEnv;
      if (act.type === '[dev-env] store transpilation') {
        if (Object.values(file).every(({ ext, contents, transpiled }) =>
          ext === 'scss' || contents === transpiled?.src
        )) {
          return [Act.setTsAndTsxValidity(true),
            ...Object.values(panelToApp).map(({ key }) =>
              Thunk.bootstrapApp({ panelKey: key }))];
        } else if (tsAndTsxValid) {
          return [Act.setTsAndTsxValidity(false)];
        }
      } else if (act.type === '[dev-env] remember app panel') {
        if (tsAndTsxValid) {
          return [Thunk.bootstrapApp({ panelKey: act.pay.panelKey })];
        }
      } else {
        return [Thunk.unmountApp({ panelKey: act.pay.panelKey })];
      }
      return [];
    }),
  ),
);

const initializeFileSystem = createEpic(
  (action$, _state$) => action$.pipe(
    filterActs('persist/REHYDRATE' as any),
    map(() => Thunk.initialize({})),
  ),
);

const initializeMonacoModels = createEpic(
  (action$, state$) => action$.pipe(
    filterActs('[editor] set monaco loaded'),
    filter(({ pay: { loaded } }) => loaded),
    flatMap(() => [
      // NOTE turning off diagnostics causes initial tryTranspileModel to hang
      // EditorThunk.setTypescriptDiagnostics({ mode: 'off' }),
      ...Object.values(state$.value.devEnv.file).flatMap((file) => [
        EditorThunk.ensureMonacoModel({ filename: file.key, code: file.contents }),
      ]),
      // EditorThunk.setTypescriptDiagnostics({ mode: 'on' }),
    ]),
  ),
);

const trackFilePanels = createEpic(
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
          LayoutThunk.setPanelTitle({ panelKey, title: filename }),
          Act.rememberFilePanel({ filename, panelKey }),
          ...(file[filename] ? [] : [Act.createFile({ filename, contents: '' })]),
        ];
      }
      return [Act.forgetFilePanel({ panelKey })];
    }),
  ),
);

const trackFileContents = createEpic(
  (action$, state$) => action$.pipe(
    filterActs('[editor] store monaco model'),
    flatMap(({ pay: { model, filename, editorKey, modelKey } }) => {
      const { file } = state$.value.devEnv;
      if (file[filename]) {
        model.setValue(file[filename].contents);
        return [Thunk.setupFileUpdateTranspile({ editorKey, filename, modelKey })];
      }
      console.warn(`Ignored filename "${filename}" (untracked)`);
      return [];
    }),
  ),
);

const togglePanelMenuEpic = createEpic(
  (action$, _state$) => action$.pipe(
    filterActs('[layout] clicked panel title'),
    map(({ args: { panelKey } }) => {
      console.log({ detectedTitleClick: panelKey });
      /**
       * TODO
       */
      return { type: 'fake' } as any;
    }),
  ),
);

export const epic = combineEpics(
  bootstrapAppInstances,
  initializeFileSystem,
  initializeMonacoModels,
  trackFilePanels,
  trackFileContents,
  togglePanelMenuEpic,
);
