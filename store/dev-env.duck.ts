import { combineEpics } from 'redux-observable';
import { map, filter, flatMap } from 'rxjs/operators';
import { ReactDOM } from '../public/es-react'; // Runtime react

import { createAct, ActionsUnion, addToLookup, removeFromLookup, updateLookup, ReduxUpdater } from '@model/store/redux.model';
import { KeyedLookup, testNever, lookupFromValues } from '@model/generic.model';
import { createThunk, createEpic } from '@model/store/root.redux.model';
import { exampleTsx3, exampleScss1, exampleTs1 } from '@model/code/examples';
import { panelKeyToAppElId, FileState, filenameToModelKey, TranspiledCodeFile, isFileValid, getReachableJsFiles, filenameToScriptId, appendEsmModule, panelKeyToAppScriptId, CodeFile, CodeTranspilation, StyleTranspilation } from '@model/code/dev-env.model';
import { JsImportMeta, JsExportMeta, relPathsToFilenames, traverseDeps, UntranspiledPathInterval, getCyclicDepMarker, CyclicDepError, stratifyJsFiles, patchTranspiledJsFiles, relPathToFilename } from '@model/code/patch-imports.model';
import { getBootstrapAppCode } from '@model/code/bootstrap';

import { filterActs } from './reducer';
import { Thunk as EditorThunk } from './editor.duck';
import { Thunk as LayoutThunk } from './layout.duck';
import { TranspilationResult } from '@model/monaco/monaco.model';

export interface State {
  file: KeyedLookup<FileState>;
  initialized: boolean;
  panelToApp: KeyedLookup<PanelApp>;
  panelToFile: KeyedLookup<PanelFile>;
  bootstrapped: boolean;
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
  bootstrapped: false,
};

export const Act = {
  addFileCleanups: (filename: string, cleanups: (() => void)[]) =>
    createAct('[dev-env] add file cleanups', { filename, cleanups }),
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
  setBootstrapped: (isValid: boolean) =>
    createAct('[dev-env] set ts/tsx validity', { isValid }),
  storeCodeTranspilation: (filename: string, transpilation: CodeTranspilation) =>
    createAct('[dev-env] store code transpilation', { filename, transpilation }),
  storeStyleTranspilation: (filename: string, transpilation: StyleTranspilation) =>
    createAct('[dev-env] store style transpilation', { filename, transpilation }),
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
    async ({ dispatch, getState }) => {
      /**
       * Files reachable from `index.tsx` have acyclic dependencies, modulo
       * untranspiled transitive-dependencies at time they were checked.
       * All reachable files are now transpiled, so can now test for cycles.
       */
      const { cyclicDepError } = await dispatch(Thunk.testCyclicJsDependency({ filename: 'index.tsx' }));
      if (cyclicDepError) {
        console.error('Bootstrap failed due to cyclic dependency');
        dispatch(Thunk.tryTranspileCodeModel({ filename: 'index.tsx' }));
        return;
      }

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
      dispatch(Act.setBootstrapped(true));
    },
  ),
  /**
   * Detect dependency cycles in transpiled js, including reflexive.
   * We don't support them because we use blob urls to resolve modules.
   */
  detectCodeDependencyCycles: createThunk(
    '[dev-env] detect code dependency cycles',
    ({ state: { devEnv } }, { filename, imports, exports }: {
      filename: string;
      imports: JsImportMeta[];
      exports: JsExportMeta[];
    }): null | CyclicDepError => {
      const filenames = Object.keys(devEnv.file);
      const dependencyPaths = relPathsToFilenames(([] as string[]).concat(
        imports.map(({ path }) => path.value),
        exports.map(({ from }) => from?.value as string).filter(Boolean),
      ), filenames);
      /** Files that `filename` imports/exports */
      const dependencies = dependencyPaths.map(filename => devEnv.file[filename] as CodeFile);
      /** Files that import/export `filename`, and `filename` itself */
      const dependents = Object.values(devEnv.file).filter(({ key, transpiled }) =>
        key === filename || (transpiled?.type === 'js' && (
          transpiled.importFilenames.includes(filename)
          || transpiled.exportFilenames.includes(filename)
        ))
      ) as CodeFile[];
      /**
       * Error iff adding this module creates a cycle i.e.
       * some _direct dependency_ of `filename` has
       * some _direct dependent_ of `filename` as a transitive-dependency.
       */
      for (const dependencyFile of dependencies) {
        const error = traverseDeps(
          dependencyFile,
          devEnv.file as KeyedLookup<CodeFile>,
          lookupFromValues(dependents),
          filenames.length,
        );
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
  /**
   * To display app need to replace import/export specifers in transpiled js by
   * valid urls. We use (a) an asset url for react, (b) blob urls for relative paths.
   */
  patchAllTranspiledCode: createThunk(
    '[dev-env] patch all transpiled code',
    ({ dispatch, state: { devEnv } }) => {
      const jsFiles = getReachableJsFiles(devEnv.file) as TranspiledCodeFile[];
      const stratification = stratifyJsFiles(jsFiles);
      const filenameToPatched = patchTranspiledJsFiles(lookupFromValues(jsFiles), stratification);
      for (const [filename, { patchedCode, blobUrl }] of Object.entries(filenameToPatched)) {
        dispatch(Act.updateFile(filename, { esm: { patchedCode, blobUrl } }));
      }
    },
  ),
  rememberSrcCodeImportsExports: createThunk(
    '[dev-env] remember src code import/exports',
    async ({ dispatch, state: { devEnv } }, { filename, modelKey }: { filename: string; modelKey: string }) => {
      const { imports, exports } = await dispatch(EditorThunk.computeTsImportExports({ filename, modelKey }));
      const filenames = Object.keys(devEnv.file);

      const metas = imports.map(({ path }) => path).concat(
        exports.map(({ from }) => from!).filter(Boolean)
      );
      const pathIntervals: UntranspiledPathInterval[] = metas
        .map(({ value, start, startCol, startLine }) => ({
          path: value,
          start, startCol, startLine,
          filename: value === 'react'
            ? null
            : relPathToFilename(value, filenames) || null,
        }));

      dispatch(Act.updateFile(filename, { pathIntervals }));
      return { pathIntervals };
    },
  ),
  /** Initialize (debounced) storage of model contents on model change. */
  setupRememberFileContents: createThunk(
    '[dev-env] setup remember file contents',
    ({ dispatch }, { filename, modelKey }: { filename: string; modelKey: string }) => {
      const storeFileContents = (contents: string) => dispatch(Act.updateFile(filename, { contents }));
      const disposable = dispatch(EditorThunk.trackModelChange({ do: storeFileContents, debounceMs: 500, modelKey }));
      dispatch(Act.addFileCleanups(filename, [() => disposable.dispose()]));
    },
  ),
  /** Initialize (debounced) transpilation of model contents on model change. */
  setupFileTranspile: createThunk(
    '[dev-env] setup code file transpile',
    ({ dispatch }, { modelKey, filename }: { modelKey: string; filename: string }) => {
      const transpileCode = /\.tsx?$/.test(filename)
        ? () => dispatch(Thunk.tryTranspileCodeModel({ filename }))
        : () => dispatch(Thunk.tryTranspileStyleModel({ filename }));
      const disposable = dispatch(EditorThunk.trackModelChange({ do: transpileCode, debounceMs: 500, modelKey }));
      dispatch(Act.addFileCleanups(filename, [() => disposable.dispose()]));
    },
  ),
  testCyclicJsDependency: createThunk(
    '[dev-env] test cyclic dependency',
    async ({ dispatch, state: { devEnv } }, { filename, nextTranspiledJs }: { filename: string; nextTranspiledJs?: string }) => {
      const file = devEnv.file[filename] as CodeFile;
      /** Code defaults to previously transpiled js */
      const code = nextTranspiledJs || file.transpiled!.dst;
      const { imports, exports } = await dispatch(EditorThunk.computeTsImportExports({ filename, code }));
      const cyclicDepError = dispatch(Thunk.detectCodeDependencyCycles({ filename, imports, exports })) as null | CyclicDepError;
      return {
        imports,
        exports,
        cyclicDepError,
        /** True iff previous transpilation exists and had `cyclicDepError` */
        prevCyclicError: file.transpiled?.cyclicDepError || null,
      };
    },
  ),
  /** Returns true iff is valid */
  tryTranspileCodeModel: createThunk(
    '[dev-env] try transpile code model',
    async ({ dispatch, state: { devEnv } }, { filename, onlyIf }: {
      filename: string;
      onlyIf?: 'valid' | 'invalid';
    }) => {
      // Can require file currently valid/invalid to break cycles
      const isValid = isFileValid(devEnv.file[filename]);
      if (onlyIf === 'valid' && !isValid || onlyIf === 'invalid' && isValid) {
        return;
      }

      // Transpile if needed
      const modelKey = filenameToModelKey(filename);
      const currFile = devEnv.file[filename] as CodeFile;
      const needsTranspile = currFile.transpiled?.src !== currFile.contents;
      const transpiled: TranspilationResult = currFile.transpiled && !needsTranspile
        ? { key: 'success', src: currFile.contents, transpiledJs: currFile.transpiled.dst, typings: currFile.transpiled.typings }
        : await dispatch(EditorThunk.transpileTsMonacoModel({ modelKey }));

      if (transpiled.key !== 'success') {
        // Don't show cyclic dependency error if transpile failed
        dispatch(EditorThunk.setModelMarkers({ modelKey, markers: [] }));
        // Clear previous state for cleanliness
        dispatch(Act.updateFile(filename, { transpiled: null, pathIntervals: [] }));
        return;
      }
      
      // Remember code intervals of import/export specifiers so can show errors there
      const { pathIntervals: importIntervals } = await dispatch(Thunk.rememberSrcCodeImportsExports({ filename, modelKey }));
      // Test for cyclic dependency
      const { imports, exports, cyclicDepError, prevCyclicError } =
        await dispatch(Thunk.testCyclicJsDependency({ filename, nextTranspiledJs: transpiled.transpiledJs }));

      if (!needsTranspile && cyclicDepError === prevCyclicError) {
        return; // Needed?
      }

      dispatch(Thunk.updateCodeTranspilation({
        filename,
        src: transpiled.src,
        dst: transpiled.transpiledJs, // Unpatched code
        imports,
        exports,
        typings: transpiled.typings,
        cyclicDepError,
      }));

      if (cyclicDepError) {
        console.error(`Cyclic dependency for ${filename}: ${JSON.stringify(cyclicDepError)}`);
        // Expect importIntervals paths like ./foo-bar
        const badIntervals = importIntervals.filter(({ path }) => cyclicDepError.dependency.startsWith(path.slice(2)));
        dispatch(EditorThunk.setModelMarkers({ modelKey,
          markers: badIntervals.map((interval) => getCyclicDepMarker(interval)),
        })); // Retranspile cyclic dependency if currently valid
        dispatch(Thunk.tryTranspileCodeModel({ filename: cyclicDepError.dependency, onlyIf: 'valid' }));
        return;
      }

      dispatch(EditorThunk.setModelMarkers({ modelKey, markers: [] }));
      if (prevCyclicError) {// Just recovered from cyclic dependency
        dispatch(Thunk.tryTranspileCodeModel({ filename: prevCyclicError.dependency, onlyIf: 'invalid' }));
      }
    },
  ),
  tryTranspileStyleModel: createThunk(
    '[dev-env] try transpile style model',
    async ({ dispatch }, { filename }: { filename: string }) => {
      /**
       * No natural way to get synced 'scss' model error markers,
       * so catch errors via transpilation instead.
       */
      try {
        const modelKey = filenameToModelKey(filename);
        /**
         * TODO test for @import cycles.
         */
        const transpiled = await dispatch(EditorThunk.transpileScssMonacoModel({ modelKey }));

        dispatch(Act.storeStyleTranspilation(filename, {
          type: 'css',
          src: transpiled.src,
          dst: transpiled.dst,
          cleanups: [],
        }));
      } catch (e) {
        console.error(e);
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
      const filenames = Object.keys(devEnv.file);
      dispatch(Act.storeCodeTranspilation(filename, { type: 'js', ...rest,
        cleanups: [() => disposable.dispose()],
        importFilenames: relPathsToFilenames(
          rest.imports.map(({ path }) => path.value), filenames),
        exportFilenames: relPathsToFilenames(
          rest.exports.map(({ from }) => from?.value as string).filter(Boolean), filenames),
      }));
    },
  ),
};

export type Thunk = ActionsUnion<typeof Thunk>;

export const reducer = (state = initialState, act: Action): State => {
  switch (act.type) {
    case '[dev-env] add file cleanups': return { ...state,
      file: updateLookup(act.pay.filename, state.file, ({ cleanupTrackers }) => ({
        cleanupTrackers: cleanupTrackers.concat(act.pay.cleanups),
      })),
    };
    case '[dev-env] create file': return { ...state,
      file: addToLookup({
        key: act.pay.filename,
        contents: act.pay.contents,
        ext: act.pay.filename.split('.').pop() as any, // no dot
        transpiled: null,
        pathIntervals: [],
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
      bootstrapped: act.pay.isValid,
    };
    case '[dev-env] store style transpilation': return { ...state,
      file: updateLookup(act.pay.filename, state.file, () => ({
        transpiled: act.pay.transpilation,
      })),
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
      const { file, bootstrapped: tsAndTsxValid } = state$.value.devEnv;

      if (act.type === '[dev-env] store code transpilation') {
        const reachableJsFiles = getReachableJsFiles(file);
        if (!reachableJsFiles.includes(file[act.pay.filename] as CodeFile)) {
          return []; // Ignore files unreachable from index.tsx
        }
        if (reachableJsFiles.every((f) => isFileValid(f))) {
          // console.log('triggered by', act.pay.filename);
          return [// All reachable code is valid so can bootstrap app
            // Act.setTsAndTsxValidity(true),
            Thunk.bootstrapApps({}),
          ];
        } else if (tsAndTsxValid) {
          return [Act.setBootstrapped(false)];
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
        // Initial transpile
        ...file.ext === 'scss'
          ? [Thunk.tryTranspileStyleModel({ filename: file.key })]
          : [Thunk.tryTranspileCodeModel({ filename: file.key })],
      ]),
    ]
    ),
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
        // Initially load file contents
        model.setValue(file[filename].contents);
        return [// Setup tracking
          Thunk.setupRememberFileContents({ modelKey, filename }),
          Thunk.setupFileTranspile({ modelKey, filename }),
        ];
      }
      console.warn(`Ignored filename "${filename}" (not found in state)`);
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
