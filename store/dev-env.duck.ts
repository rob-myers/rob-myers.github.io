import { combineEpics } from 'redux-observable';
import { map, filter, flatMap } from 'rxjs/operators';
import { ReactDOM } from '../public/es-react'; // Runtime react

import { createAct, ActionsUnion, addToLookup, removeFromLookup, updateLookup, ReduxUpdater } from '@model/store/redux.model';
import { KeyedLookup, testNever, lookupFromValues } from '@model/generic.model';
import { createThunk, createEpic } from '@model/store/root.redux.model';
import { exampleTsx3, exampleScss1, exampleTs1 } from '@model/code/examples';
import { panelKeyToAppElId, FileState, filenameToModelKey, TranspiledCodeFile, isFileValid, getReachableJsFiles, filenameToScriptId, appendEsmModule, panelKeyToAppScriptId, CodeFile, CodeTranspilation } from '@model/code/dev-env.model';
import { JsImportMeta, JsExportMeta, importPathsToFilenames, traverseDeps, UntranspiledImportPath, getCyclicDepMarker, CyclicDepError, stratifyJsFiles, patchTranspilations, relPathToFilename } from '@model/code/patch-imports.model';
import { getBootstrapAppCode } from '@model/code/bootstrap';

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
  storeCodeTranspilation: (filename: string, transpilation: CodeTranspilation) =>
    createAct('[dev-env] store code transpilation', { filename, transpilation }),
  updateFile: (filename: string, updates: Partial<FileState>) =>
    createAct('[dev-env] update file', { filename, updates }),
  updatePanelFileMeta: (panelKey: string, updates: ReduxUpdater<PanelFile>) =>
    createAct('[dev-env] update panel file meta', { panelKey, updates }),
};

export type Action = ActionsUnion<typeof Act>;

export const Thunk = {
  bootstrapAppInstance: createThunk(
    '[dev-env] bootstrap app instance',
    ({ state: { devEnv } }, { panelKey }: { panelKey: string }) => {
      const appInstanceElId = panelKeyToAppElId(panelKey);
      const { blobUrl: appBlobUrl } = (devEnv.file['index.tsx'] as CodeFile).esm!;
      
      const bootstrapCode = getBootstrapAppCode(appBlobUrl, appInstanceElId);
      const bootstrapBlob = new Blob([bootstrapCode], { type: 'text/javascript' });
      const bootstrapUrl = URL.createObjectURL(bootstrapBlob);      
      
      const bootstrapScriptId = panelKeyToAppScriptId(panelKey);
      appendEsmModule({ scriptId: bootstrapScriptId, scriptSrcUrl: bootstrapUrl });
      // console.log({ mountedAppAt: document.getElementById(appInstanceElId) });
    },
  ),
  bootstrapApps: createThunk(
    '[dev-env] bootstrap apps',
    ({ dispatch, getState }) => {
      dispatch(Thunk.patchAllTranspiledCode({}));
      const { devEnv } = getState();
      const jsFiles = getReachableJsFiles(devEnv.file).reverse();
      for (const { key: filename, esm } of jsFiles) {
        appendEsmModule({
          scriptId: filenameToScriptId(filename),
          scriptSrcUrl: esm!.blobUrl,
        });
      }
      for (const { key: panelKey } of Object.values(devEnv.panelToApp)) {
        dispatch(Thunk.bootstrapAppInstance({ panelKey }));
      }
    },
  ),
  /**
   * Detect dependency cycles in transpiled js, including reflexive.
   * We don't support them because we use blob urls for modules.
   */
  detectCodeDependencyCycles: createThunk(
    '[dev-env] detect code dependency cycles',
    ({ state: { devEnv } }, { filename, imports }: {
      filename: string;
      imports: JsImportMeta[];
    }): null | CyclicDepError => {
      const filenames = Object.keys(devEnv.file);
      const dependencyPaths = importPathsToFilenames(imports.map(({ path }) => path.value), filenames);
      const dependencies = dependencyPaths.map(filename => devEnv.file[filename] as CodeFile);
      const dependents = Object.values(devEnv.file).filter(({ transpiled }) =>
        transpiled?.type === 'js' && transpiled.importFilenames.includes(filename)) as CodeFile[];
      // console.log({ filename, dependencies: dependencyPaths, dependents: dependents.map(({ key }) => key) });

      if (dependencyPaths.includes(filename)) {// Reflexive
        return { key: 'dep-cycle', dependency: filename, dependent: filename };
      }
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
  /** Patch import specifiers in transpiled js i.e. convert to blob urls */
  patchAllTranspiledCode: createThunk(
    '[dev-env] patch all transpiled code',
    ({ dispatch, state: { devEnv } }) => {
      const jsFiles = getReachableJsFiles(devEnv.file) as TranspiledCodeFile[];
      const stratification = stratifyJsFiles(jsFiles);
      const filenameToPatched = patchTranspilations(lookupFromValues(jsFiles), stratification);
      for (const [filename, { patchedCode, blobUrl }] of Object.entries(filenameToPatched)) {
        dispatch(Act.updateFile(filename, { esm: { patchedCode, blobUrl } }));
      }
    },
  ),
  rememberSrcCodeImports: createThunk(
    '[dev-env] remember src code imports',
    async ({ dispatch, state: { devEnv } }, { filename, modelKey }: { filename: string; modelKey: string }) => {
      const { imports } = await dispatch(EditorThunk.computeTsImportExports({ filename, modelKey }));
      const filenames = Object.keys(devEnv.file);
      const importIntervals: UntranspiledImportPath[] = imports
        .map(({ path: { value, start, startCol, startLine } }) => ({
          path: value,
          start, startCol, startLine,
          filename: value === 'react'
            ? null
            : relPathToFilename(value, filenames) || null,
        }));
      dispatch(Act.updateFile(filename, { importIntervals }));
      // console.log({ importIntervals });
      return { importIntervals };
    },
  ),
  /**
   * Debounced storage of model contents on model change.
   * Debounced transpilation of model contents on model change.
   */
  setupCodeFileTranspile: createThunk(
    '[dev-env] setup code file transpile',
    ({ dispatch }, { modelKey, filename }: { modelKey: string; filename: string }) => {
      const storeSrcCode = (contents: string) => dispatch(Act.updateFile(filename, { contents }));
      const dA = dispatch(EditorThunk.trackModelChange({ do: storeSrcCode, debounceMs: 500, modelKey }));

      const transpileCode = () => dispatch(Thunk.tryTranspileCodeModel({ filename }));
      const dB = dispatch(EditorThunk.trackModelChange({ do: transpileCode, debounceMs: 500, modelKey }));
      transpileCode(); // Initial transpile

      dispatch(Act.updateFile(filename, { cleanupTrackers: [() => dA.dispose(), () => dB.dispose()] }));
    },
  ),
  tryTranspileCodeModel: createThunk(
    '[dev-env] try transpile code model',
    async ({ dispatch, state: { devEnv } }, { filename, onlyIf }: {
      filename: string;
      onlyIf?: 'valid' | 'invalid';
    }) => {
      // Can specifiy whether should be valid/invalid to break cycles
      const isValid = isFileValid(devEnv.file[filename]);
      if (onlyIf === 'valid' && !isValid || onlyIf === 'invalid' && isValid) {
        return;
      }

      const modelKey = filenameToModelKey(filename);
      const transpiled = await dispatch(EditorThunk.transpileTsMonacoModel({ modelKey }));
      if (transpiled.key !== 'success') {
        // Don't show cyclic dependency error if transpile failed
        dispatch(EditorThunk.setModelMarkers({ modelKey, markers: [] }));
        return;
      }

      const { importIntervals } = await dispatch(Thunk.rememberSrcCodeImports({ filename, modelKey }));
      const { imports, exports } = await dispatch(EditorThunk
        .computeTsImportExports({ filename, code: transpiled.transpiledJs }));
      const error = dispatch(Thunk.detectCodeDependencyCycles({ filename, imports }));
      const prevError = (devEnv.file[filename]?.transpiled as CodeTranspilation)?.cyclicDepError || null;

      dispatch(Thunk.updateCodeTranspilation({
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
        if (prevError) {// Just recovered from cyclic dependency
          dispatch(Thunk.tryTranspileCodeModel({ filename: prevError.dependency, onlyIf: 'invalid' }));
        }
      } else {
        console.error(`Cyclic dependency for ${filename}: ${JSON.stringify(error)}`);
        // Expect importIntervals paths like ./foo-bar
        const badPaths = importIntervals.filter(x => error.dependency.startsWith(x.path.slice(2)));
        dispatch(EditorThunk.setModelMarkers({
          modelKey,
          markers: badPaths.map((importPath) => getCyclicDepMarker(importPath)),
        }));
        // Retranspile cyclic dependency if currently valid
        dispatch(Thunk.tryTranspileCodeModel({ filename: error.dependency, onlyIf: 'valid' }));
      }
    },
  ),
  unmountAppInstance: createThunk(
    '[dev-env] unmount app instance',
    (_, { panelKey }: { panelKey: string }) => {
      // Remove bootstrap script
      document.getElementById(panelKeyToAppScriptId(panelKey))?.remove();
      // Unmount react app
      const el = document.getElementById(panelKeyToAppElId(panelKey));
      el && ReactDOM.unmountComponentAtNode(el);
      // console.log({ unmountedAppAt: el });
    },
  ),
  updateCodeTranspilation: createThunk(
    '[dev-env] update code transpilation',
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
      dispatch(Act.storeCodeTranspilation(filename, { type: 'js', ...rest, cleanups, importFilenames }));
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
        ext: act.pay.filename.split('.').pop() as any, // no dot
        transpiled: null,
        importIntervals: [],
        cleanupTrackers: [],
        esm: null,
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
    case '[dev-env] store code transpilation': return { ...state,
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
      '[dev-env] store code transpilation',
      '[dev-env] remember app panel',
      '[dev-env] forget app panel',
    ),
    flatMap((act) => {
      const { file, tsAndTsxValid } = state$.value.devEnv;
      if (act.type === '[dev-env] store code transpilation') {
        if (getReachableJsFiles(file).every((f) => isFileValid(f))) {
          return [// All code is valid so can bootstrap app
            Act.setTsAndTsxValidity(true),
            Thunk.bootstrapApps({}),
          ];
        } else if (tsAndTsxValid) {
          return [Act.setTsAndTsxValidity(false)];
        }
      } else if (act.type === '[dev-env] remember app panel') {
        if (tsAndTsxValid) {
          return [Thunk.bootstrapAppInstance({ panelKey: act.pay.panelKey })];
        }
      } else {
        return [Thunk.unmountAppInstance({ panelKey: act.pay.panelKey })];
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
    // NOTE turning off diagnostics causes initial tryTranspileModel to hang
    flatMap(() => [
      ...Object.values(state$.value.devEnv.file).flatMap((file) => [
        EditorThunk.ensureMonacoModel({ filename: file.key, code: file.contents }),
      ]),
    ]),
  ),
);

const trackFilePanels = createEpic(
  (action$, state$) => action$.pipe(
    filterActs(
      '[layout] panel created',
      '[layout] panel closed',
    ),
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

const trackCodeFileContents = createEpic(
  (action$, state$) => action$.pipe(
    filterActs('[editor] store monaco model'),
    flatMap(({ pay: { model, filename, modelKey } }) => {
      const { file } = state$.value.devEnv;
      if (file[filename]) {
        model.setValue(file[filename].contents);
        return [Thunk.setupCodeFileTranspile({ modelKey, filename })];
      }
      console.warn(`Ignored filename "${filename}" (untracked)`);
      return [];
    }),
  ),
);

const togglePanelMenuEpic = createEpic(
  (action$, _state$) => action$.pipe(
    filterActs('[layout] clicked panel title'),
    flatMap(({ args: { panelKey } }) => {
      console.log({ detectedTitleClick: panelKey });
      /**
       * TODO
       */
      return [];
    }),
  ),
);

export const epic = combineEpics(
  bootstrapAppInstances,
  initializeFileSystem,
  initializeMonacoModels,
  trackFilePanels,
  trackCodeFileContents,
  togglePanelMenuEpic,
);
