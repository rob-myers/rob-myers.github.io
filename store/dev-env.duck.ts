import { combineEpics } from 'redux-observable';
import { map, filter, flatMap } from 'rxjs/operators';
import { createAct, ActionsUnion, addToLookup, removeFromLookup, updateLookup, ReduxUpdater } from '@model/store/redux.model';
import { KeyedLookup, testNever, lookupFromValues } from '@model/generic.model';
import { createThunk, createEpic } from '@model/store/root.redux.model';
import { exampleTsx3, exampleScss1, exampleTs1 } from '@model/code/examples';
import { panelKeyToAppElId, JsImportMeta, JsExportMeta, importPathsToFilenames, FileState, Transpilation, traverseDeps, UntranspiledImportPath, getCyclicDepMarker, filenameToModelKey, isFileValid, CyclicDepError, TranspiledJs, stratifyJsFiles, TranspiledFile } from '@model/code/dev-env.model';

import { filterActs } from './reducer';
import { Thunk as EditorThunk } from './editor.duck';
import { Thunk as LayoutThunk } from './layout.duck';

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
}
interface PanelApp {
  /** Panel key */
  key: string;
  elementId: string;
}

const initialState: State = {
  file: {},
  initialized: false,
  panelToApp: {},
  panelToFile: {},
  tsAndTsxValid: false,
};

export const Act = {
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
  bootstrapApp: createThunk(
    '[dev-env] bootstrap app',
    (_, { panelKey }: { panelKey: string }) => {
      const el = document.getElementById(panelKeyToAppElId(panelKey));
      /**
       * TODO
       */
      console.log({ mountAppAt: el });
    },
  ),
  bootstrapApps: createThunk(
    '[dev-env] bootstrap apps',
    ({ dispatch, state: { devEnv } }) => {
      dispatch(Thunk.patchAllTranspiledJs({}));
      for (const { key: panelKey } of Object.values(devEnv.panelToApp)) {
        dispatch(Thunk.bootstrapApp({ panelKey }));
      }
    },
  ),
  /**
   * Detect dependency cycles in transpiled js.
   * We don't support them because we use blob urls for modules.
   */
  detectDependencyCycles: createThunk(
    '[dev-env] check dependency cycles',
    ({ state: { devEnv } }, { filename, imports }: {
      filename: string;
      imports: JsImportMeta[];
    }): null | CyclicDepError => {
      const filenames = Object.keys(devEnv.file);
      const dependencyPaths = importPathsToFilenames(imports.map(({ path }) => path.value), filenames)
        .filter((path) => path !== filename); // permit reflexive dependency e.g. alias
      const dependencies = dependencyPaths.map(filename => devEnv.file[filename]);
      const dependents = Object.values(devEnv.file)
        .filter(({ key }) => key !== filename) // permit reflexive dependent e.g. alias
        .filter(({ transpiled }) => transpiled?.type === 'js' && transpiled.importFilenames.includes(filename));
      const dependentPaths = dependents.map(({ key }) => key);
      console.log({ filename, dependencies: dependencyPaths, dependents: dependentPaths });

      for (const dependencyFile of dependencies) {
        const error = traverseDeps(dependencyFile, devEnv.file, lookupFromValues(dependents), filenames.length);
        if (error) {
          return { ...error, dependency: dependencyFile.key };
        }
      }
      return null;
    },
  ),
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
  /** Patch import specifiers i.e. convert to blob urls */
  patchAllTranspiledJs: createThunk(
    '[dev-env] patch transpiled js',
    ({ dispatch: _, state: { devEnv } }) => {
      const jsFiles = Object.values(devEnv.file)
        .filter(({ ext }) => ext === 'ts' || ext === 'tsx') as TranspiledFile[];
      const _stratification = stratifyJsFiles(jsFiles);
      /**
       * TODO patch files and mount <script>'s in order induced by stratification
       */
      // const patchedJs = dispatch(EditorThunk.patchTranspiledImports({ js: transpiled.transpiledJs }));
      // console.log({ transpiled: patchedJs });
    },
  ),
  rememberSrcImports: createThunk(
    '[dev-env] remember untranspiled imports',
    async ({ dispatch }, { filename, modelKey }: { filename: string; modelKey: string }) => {
      const { imports } = await dispatch(EditorThunk.computeImportExports({ filename, modelKey }));
      const importPaths: UntranspiledImportPath[] = imports
        .map(({ path: { value, start, startCol, startLine } }) =>
          ({ path: value, start, startCol, startLine }));
      dispatch(Act.updateFile(filename, { importPaths }));
      console.log({ importPaths });
      return { importPaths };
    },
  ),
  setupFileUpdateTranspile: createThunk(
    '[dev-env] setup file update/transpile',
    ({ dispatch }, { editorKey, filename }: { editorKey: string; filename: string }) => {
      const updateCode = (contents: string) => dispatch(Act.updateFile(filename, { contents }));
      const dA = dispatch(EditorThunk.trackModelChange({ do: updateCode, debounceMs: 500, editorKey }));

      const transpileCode = () => dispatch(Thunk.tryTranspileModel({ filename }));
      const dB = dispatch(EditorThunk.trackModelChange({ do: transpileCode, debounceMs: 500, editorKey }));
      transpileCode(); // Initial transpile

      dispatch(Act.updateFile(filename, { cleanupTrackers: [() => dA.dispose(), () => dB.dispose()] }));
    },
  ),
  tryTranspileModel: createThunk(
    '[dev-env] try transpile model',
    async ({ dispatch, state: { devEnv } }, { filename, onlyIf }: {
      filename: string;
      onlyIf?: 'valid' | 'invalid';
    }) => {
      const isValid = isFileValid(devEnv.file[filename]);
      if (onlyIf === 'valid' && !isValid || onlyIf === 'invalid' && isValid) {
        return;
      }

      const modelKey = filenameToModelKey(filename);
      const transpiled = await dispatch(EditorThunk.transpileModel({ modelKey }));

      if (transpiled.key !== 'success') {
        // Don't show cyclic dependency error if transpile failed
        dispatch(EditorThunk.setModelMarkers({ modelKey, markers: [] }));
        return ;
      }

      await dispatch(Thunk.rememberSrcImports({ filename, modelKey }));

      const { imports, exports } = await dispatch(EditorThunk
        .computeImportExports({ filename, code: transpiled.transpiledJs }));
      const error = dispatch(Thunk.detectDependencyCycles({ filename, imports }));
      const prevError = (devEnv.file[filename]?.transpiled as TranspiledJs)?.cyclicDepError || null;

      dispatch(Thunk.updateTranspilation({
        filename,
        src: transpiled.src,
        dst: transpiled.transpiledJs, // Unpatched code
        imports,
        exports,
        typings: transpiled.typings,
        cyclicDepError: error,
      }));

      if (!error) {
        dispatch(EditorThunk.setModelMarkers({ modelKey, markers: [] }));
        // Retranspile invalid dependency
        prevError && dispatch(Thunk.tryTranspileModel({ filename: prevError.dependency, onlyIf: 'invalid' }));
      } else {
        console.error(`Cyclic dependency for ${filename}: ${JSON.stringify(error)}`);

        // Expect importPaths like ./foo-bar
        const { importPaths } = await dispatch(Thunk.rememberSrcImports({ filename, modelKey }));
        const badPaths = importPaths.filter(x => error.dependency.startsWith(x.path.slice(2)));
        dispatch(EditorThunk.setModelMarkers({
          modelKey,
          markers: badPaths.map((importPath) => getCyclicDepMarker(importPath)),
        }));
        // Retranspile cyclic dependency if currently valid
        dispatch(Thunk.tryTranspileModel({ filename: error.dependency, onlyIf: 'valid' }));
      }

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
    ({ dispatch, state: { devEnv } }, { filename, ...rest }: {
      filename: string;
      src: string;
      dst: string;
      typings: string;
      imports: JsImportMeta[];
      exports: JsExportMeta[];
      cyclicDepError: null | CyclicDepError;
    }) => {
      devEnv.file[filename]?.transpiled?.cleanups.forEach(cleanup => cleanup());
      const typesFilename = filename.replace(/\.tsx?$/, '.d.ts');
      const disposable = dispatch(EditorThunk.addTypings({ filename: typesFilename, typings: rest.typings }));
      const cleanups = [() => disposable.dispose()];
      const importFilenames = importPathsToFilenames(rest.imports.map(({ path }) => path.value), Object.keys(devEnv.file));
      dispatch(Act.storeTranspilation(filename, { type: 'js', ...rest, cleanups, importFilenames }));
    },
  ),
};

export type Thunk = ActionsUnion<typeof Thunk>;

export const reducer = (state = initialState, act: Action): State => {
  switch (act.type) {
    case '[dev-env] create file': return { ...state,
      file: addToLookup({
        key: act.pay.filename,
        contents: act.pay.contents,
        // Does not include dot
        ext: act.pay.filename.split('.').pop() as any,
        transpiled: null,
        importPaths: [],
        cleanupTrackers: [],
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
      const { file, tsAndTsxValid } = state$.value.devEnv;
      if (act.type === '[dev-env] store transpilation') {
        if (Object.values(file).every((f) => isFileValid(f))) {
          // All code is valid so can bootstrap app
          return [
            Act.setTsAndTsxValidity(true),
            Thunk.bootstrapApps({}),
          ];
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
    flatMap(({ pay: { model, filename, editorKey } }) => {
      const { file } = state$.value.devEnv;
      if (file[filename]) {
        model.setValue(file[filename].contents);
        return [Thunk.setupFileUpdateTranspile({ editorKey, filename })];
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
