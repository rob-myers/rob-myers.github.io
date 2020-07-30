import { combineEpics } from 'redux-observable';
import { map, filter, flatMap } from 'rxjs/operators';
import * as portals from 'react-reverse-portal';
import FileSaver from 'file-saver';

import { renderAppAt, storeAppFromBlobUrl, unmountAppAt, initializeRuntimeStore, replaceRootReducerFromBlobUrl, updateThunkLookupFromBlobUrl, forgetAppAndStore, storeAppInvalidSignaller } from '@public/render-app';
import RefreshRuntime from '@public/es-react-refresh/runtime';

import { createAct, ActionsUnion, addToLookup, removeFromLookup, updateLookup, ReduxUpdater, redact } from '@model/store/redux.model';
import { KeyedLookup, testNever, lookupFromValues, pluck, pretty } from '@model/generic.model';
import { createThunk, createEpic } from '@model/store/root.redux.model';
import * as Dev from '@model/dev-env/dev-env.model';
import { TsTranspilationResult, filenameToModelKey } from '@model/monaco/monaco.model';
import * as PatchJs from '@model/dev-env/patch-js-imports';
import { detectInvalidScssImport, ScssImportsResult, traverseScssDeps, stratifyScssFiles, SccsImportsError } from '@model/dev-env/handle-scss-imports';
import { getCssModuleCode } from '@model/dev-env/css-module';
import { traverseGlConfig, GoldenLayoutConfig } from '@model/layout/layout.model';
import { CustomPanelMetaKey } from '@model/layout/generate-layout';
import { isCyclicDepError } from '@model/dev-env/dev-env.model';
import { manifestWebPath, PackagesManifest } from '@model/dev-env/manifest.model';
import { awaitWorker } from '@worker/syntax/worker.model';

import { filterActs } from './reducer';
import { Thunk as EditorThunk } from './editor.duck';
import { Thunk as LayoutThunk, Act as LayoutAct } from './layout.duck';

export interface State {  
  /** Persists App instances across site */
  appPortal: KeyedLookup<Dev.AppPortal>;
  /** Current project files. */
  file: KeyedLookup<Dev.FileState>;
  flag: {
    /**
     * True iff all code reachable from `app.tsx` was deemed
     * collectively valid after most recent transpilation.
     */
    appValid: boolean;
    /** Has app ever been valid? */
    appWasValid: boolean;
    initialized: boolean;
    /**
     * True iff all code reachable from `reducer.ts` was deemed
     * collectively valid after most recent transpilation.
     */
    reducerValid: boolean;
  };
  /** Loaded from folders in public/package */
  package: KeyedLookup<Dev.PackageData>;
  /** Parsed from public/package/manifest.json */
  packagesManifest: null | PackagesManifest;
  /** Mirrors layout.panel, permitting us to change panel */
  panelToMeta: KeyedLookup<Dev.DevPanelMeta>;
  panelOpener: null | PanelOpener;
  /** Name of current project i.e. a package name */
  projectKey: null | string;
  /** Saved project files */
  saved: KeyedLookup<Dev.SavedProject>;
}

interface PanelOpener {
  panelKey: string;
  elementId: string;
  /** Including `panelKey` */
  siblingKeys: string[];
}

const initialState: State = {
  appPortal: {},
  file: {},
  flag: {
    appValid: false,
    appWasValid: false,
    initialized: false,
    reducerValid: false,
  },
  package: {},
  packagesManifest: null,
  panelOpener: null,
  panelToMeta: {},
  projectKey: null,
  saved: {},
};

export const Act = {
  addAppPortal: (panelKey: string, portalNode: portals.HtmlPortalNode) =>
    createAct('[dev-env] add app portal', { panelKey, portalNode: redact(portalNode) }),
  addFileCleanups: (filename: string, cleanups: (() => void)[]) =>
    createAct('[dev-env] add file cleanups', { filename, cleanups }),
  addPackage: (newPackage: Dev.PackageData) =>
    createAct('[dev-env] add package', { newPackage }),
  appWasValid: () =>
    createAct('[dev-env] app was valid', {}),
  changePanelMeta: (panelKey: string, input: (
    | { to: 'app' }
    | { to: 'doc'; filename: string }
    | { to: 'file'; filename: string }
  )) => createAct('[dev-env] change panel meta', { panelKey, ...input }),
  closePanelOpener: () =>
    createAct('[dev-env] close panel opener', {}),
  createAppPanelMeta: (input: { panelKey: string }) =>
    createAct('[dev-env] create app panel meta', input),
  createDocPanelMeta: (input: { panelKey: string; filename: string }) =>
    createAct('[dev-env] create doc panel meta', input),
  createCodeFile: (input: { filename: string; contents: string }) =>
    createAct('[dev-env] create code file', input),
  createStyleFile: (input: { filename: string; contents: string }) =>
    createAct('[dev-env] create style file', input),
  createFilePanelMeta: (input: { panelKey: string; filename: string }) =>
    createAct('[dev-env] create file panel meta', input),
  forgetPanelMeta: (input: { panelKey: string }) =>
    createAct('[dev-env] forget panel meta', input),
  removeAppPortal: (panelKey: string) =>
    createAct('[dev-env] remove app portal', { panelKey }),
  removeFile: (input: { filename: string }) =>
    createAct('[dev-env] remove file', input),
  resetFlags: () =>
    createAct('[dev-env] reset flags', {}),
  restrictAppPortals: (input: { panelKeys: string[] }) =>
    createAct('[dev-env] restrict app portals', input),
  setAppValid: (isValid: boolean) =>
    createAct('[dev-env] set app valid', { isValid }),
  setInitialized: () =>
    createAct('[dev-env] set initialized', {}),
  setProjectKey: (projectKey: string | null) =>
    createAct('[dev-env] set project key', { projectKey }),
  setReducerValid: (isValid: boolean) =>
    createAct('[dev-env] set reducer valid', { isValid }),
  setRenderedApp: (panelKey: string) =>
    createAct('[dev-env] set rendered app', { panelKey }),
  storeCodeTranspilation: (filename: string, transpilation: Dev.CodeTranspilation) =>
    createAct('[dev-env] store code transpilation', { filename, transpilation }),
  storePackagesManifest: (manifest: PackagesManifest) =>
    createAct('[dev-env] store packages manifest', { manifest }),
  storeStyleTranspilation: (filename: string, transpilation: Dev.StyleTranspilation) =>
    createAct('[dev-env] store style transpilation', { filename, transpilation }),
  updateFile: (filename: string, updates: Partial<Dev.FileState>) =>
    createAct('[dev-env] update file', { filename, updates }),
  updatePanelMeta: (panelKey: string, updates: ReduxUpdater<Dev.DevPanelMeta>) =>
    createAct('[dev-env] update panel meta', { panelKey, updates }),
  xorPanelOpener: (input: PanelOpener) =>
    createAct('[dev-env] xor panel opener', input),
};

export type Action = ActionsUnion<typeof Act>;

export const Thunk = {
  /**
   * Add files from package.
   * Can also add them at root-level, restoring previously saved.
   */
  addFilesFromPackage: createThunk(
    '[dev-env] add files from package',
    async ({ dispatch, state: { devEnv } }, { packageName, mode = 'package' }: {
      packageName: string;
      mode?: 'package' | 'restore-root' | 'overwrite-root';
    }) => {
      let filesToCreate = [] as { filename: string; contents: string }[];
      if (mode === 'restore-root' && packageName in devEnv.saved) {
        Object.values(devEnv.saved[packageName].file)
          .forEach(({ key: filename, contents }) => filesToCreate.push({ filename, contents }));
      } else {
        const copyToRoot = mode === 'restore-root' || mode === 'overwrite-root';
        Object.values(devEnv.package[packageName].file).forEach(({ key, contents }) =>
          filesToCreate.push({
            filename: copyToRoot ? Dev.packageFilenameToLocal(key) : key,
            contents,
          }));
      }
      
      for (const { filename, contents } of filesToCreate) {
        if (Dev.isCodeFilename(filename)) {
          dispatch(Act.createCodeFile({ filename, contents }));
        } else if (Dev.isStyleFilename(filename)) {
          dispatch(Act.createStyleFile({ filename, contents }));
        }
      }
    },
  ),
  /**
   * Analyze source code, storing errors and also module specifier code-intervals,
   * so can source-map errors found in transpiled js (always tied to an import/export).
   */
  analyzeSrcCode: createThunk(
    '[dev-env] analyze code file src',
    async ({ dispatch }, { filename }: { filename: string }) => {
      const { imports, exports, srcErrors } = await dispatch(EditorThunk.computeTsImportExports({ filename }));
      // console.log({ key: 'analyzeSrcCode', filename, srcErrors, imports, exports });
      const updates = {
        pathIntervals: [
          ...imports.map(({ from: path }) => path),
          ...exports.filter(Dev.isTsExportDecl).map(({ from }) => from),
        ],
        srcErrors,
      };
      dispatch(Act.updateFile(filename, updates));
      return updates;
    },
  ),
  /**
   * Analyze transpiled javascript before we store it.
   */
  analyzeJsCode: createThunk(
    '[dev-env] analyze code file',
    async ({ dispatch, state: { devEnv } }, { filename, nextTranspiledJs }: {
      filename: string;
      nextTranspiledJs: string;
    }): Promise<Dev.AnalyzeNextCode> => {
      /**
       * Must apply react-refresh transform before checking for cyclic dependencies,
       * because later we'll patch code-intervals using computed `imports` and `exports`.
       */
      const { transformedJs } = await dispatch(Thunk.applyReactRefreshTransform({
        filename,
        js: nextTranspiledJs,
      }));
      const { imports, exports, jsErrors } = await dispatch(Thunk.testCyclicJsDependency({
        filename,
        nextTranspiledJs: transformedJs,
      }));

      return {
        transformedJs,
        jsPathErrors: jsErrors,
        jsImports: imports,
        jsExports: exports,
        prevCyclicError: (devEnv.file[filename] as Dev.CodeFile)
          .transpiled?.jsPathErrors.find(isCyclicDepError) || null,
      };
    },
  ),
  /**
   * Transform transpiled js via ReactFreshBabelPlugin.
   */
  applyReactRefreshTransform: createThunk(
    '[dev-env] apply react refresh transform',
    ({ state: { editor: { syntaxWorker } } }, { filename, js }: { filename: string; js: string }) => {
      syntaxWorker!.postMessage({ key: 'request-react-refresh-transform', filename, code: js });
      return awaitWorker('send-react-refresh-transform', syntaxWorker!, ({ origCode }) => origCode === js);
    },
  ),
  /**
   * NOOP used to trigger bootstrapAppInstance.
   */
  appPortalIsReady: createThunk(
    '[dev-env] app portal is ready',
    (_, _input: { panelKey: string }) => void null,
  ),
  /**
   * Mount or update an app instance, either
   * via code update or newly created app panel.
   */
  bootstrapAppInstance: createThunk(
    '[dev-env] bootstrap app instance',
    ({ state: { devEnv }, dispatch }, { panelKey }: { panelKey: string }) => {
      /**
       * TODO invalidate react-refresh when exports change
       */
      if (!devEnv.appPortal[panelKey].rendered) {
        renderAppAt(Dev.panelKeyToAppElId(panelKey));
        dispatch(Act.setRenderedApp(panelKey));
      } else {
        RefreshRuntime.performReactRefresh();
      }
    },
  ),
  bootstrapApps: createThunk(
    '[dev-env] bootstrap apps',
    async ({ dispatch, getState }) => {
      /**
       * Files reachable from `app.tsx` have acyclic dependencies, modulo
       * untranspiled transitive-dependencies at time they were checked.
       * All reachable files are now transpiled, so can now test for cycles.
       */
      const { jsErrors } = await dispatch(Thunk.testCyclicJsDependency({ filename: Dev.rootAppFilename }));
      if (jsErrors.find(isCyclicDepError)) {
        console.error('App bootstrap failed due to cyclic dependency');
        dispatch(Act.setAppValid(false));
        dispatch(Thunk.tryTranspileCodeModel({ filename: Dev.rootAppFilename }));
        return;
      }

      // Replace module specifiers with blob urls so can dynamically load
      await dispatch(Thunk.patchAllTranspiledCode({ rootFilename: Dev.rootAppFilename }));

      // Mount the respective es modules as <script>'s of type "module"
      const { devEnv } = getState();
      const jsFiles = Dev.getReachableJsFiles(Dev.rootAppFilename, devEnv.file).reverse();
      for (const { key: filename, esModule: esm } of jsFiles)
        Dev.ensureEsModule({ scriptId: Dev.filenameToScriptId(filename), scriptSrcUrl: esm!.blobUrl });

      // Get App from dynamic module and store inside static module
      const { blobUrl: appUrl } = (devEnv.file[Dev.rootAppFilename] as Dev.CodeFile).esModule!;
      await storeAppFromBlobUrl(appUrl);

      // Render App in each panel
      Object.values(devEnv.panelToMeta)
        .filter(({ panelType }) => panelType === 'app')
        .forEach(({ key: panelKey }) => dispatch(Thunk.bootstrapAppInstance({ panelKey })));
  
      dispatch(Act.setAppValid(true));
      if (!getState().devEnv.flag.appWasValid) {
        dispatch(Act.appWasValid());
      }
    },
  ),
  bootstrapRootReducer: createThunk(
    '[dev-env] bootstrap root reducer',
    async ({ dispatch, getState }) => {

      // We verify dependencies are acyclic
      const { jsErrors } = await dispatch(Thunk.testCyclicJsDependency({ filename: Dev.rootReducerFilename }));
      if (jsErrors.find(isCyclicDepError)) {
        console.error('Root reducer bootstrap failed due to cyclic dependency');
        dispatch(Act.setReducerValid(false));
        dispatch(Thunk.tryTranspileCodeModel({ filename: Dev.rootReducerFilename }));
        return;
      }
      // Replace module specifiers with blob urls so can dynamically load
      await dispatch(Thunk.patchAllTranspiledCode({ rootFilename: Dev.rootReducerFilename }));

      // Mount scripts
      const { devEnv } = getState();
      const jsFiles = Dev.getReachableJsFiles(Dev.rootReducerFilename, devEnv.file).reverse();
      for (const { key: filename, esModule: esm } of jsFiles)
        Dev.ensureEsModule({ scriptId: Dev.filenameToScriptId(filename), scriptSrcUrl: esm!.blobUrl });
      
      // Replace root reducer and thunk lookup
      const { blobUrl: reducerUrl } = (devEnv.file[Dev.rootReducerFilename] as Dev.CodeFile).esModule!;
      await replaceRootReducerFromBlobUrl(reducerUrl);
      await updateThunkLookupFromBlobUrl(reducerUrl);

      dispatch(Act.setReducerValid(true));
      if (!devEnv.flag.appWasValid) {
        dispatch(Thunk.tryTranspileCodeModel({ filename: 'app.tsx' }));
      }
    },
  ),
  /**
   * Mount transpiled scss on the page using a style tag.
   */
  bootstrapStyles: createThunk(
    '[dev-env] bootstrap styles',
    ({ state: { devEnv } }, { filename }: { filename: string }) => {
      const styleElId = Dev.filenameToStyleId(filename);
      const styles = (devEnv.file[filename] as Dev.TranspiledStyleFile).transpiled.dst;
      Dev.ensureStyleTag({ styleId: styleElId, styles });
    },
  ),
  changePanel: createThunk(
    '[dev-env] change panel contents',
    ({ dispatch, state: { layout } }, { panelKey, next }: {
      panelKey: string;
      next: (
        | { to: 'app' }
        | { to: 'doc'; filename: string }
        | { to: 'file'; filename: string }
      );
    }) => {
      dispatch(Act.changePanelMeta(panelKey, next));

      // Mutate golden-layout config so change remembered on persist
      const glConfig = layout.goldenLayout!.config as GoldenLayoutConfig<CustomPanelMetaKey>;
      traverseGlConfig(glConfig, (node) => {
        if ('type' in node && node.type === 'component' && node.props.panelKey === panelKey) {
          const panelMeta = node.props.panelMeta!;
          if (next.to === 'app') {
            delete panelMeta.filename;
            panelMeta.devEnvComponent = node.title = 'App';
          } else if (next.to === 'doc') {
            panelMeta.devEnvComponent = 'Doc';
            panelMeta.filename = node.title = next.filename;
          } else {
            delete panelMeta.devEnvComponent;
            panelMeta.filename = node.title = next.filename;
          }
        }
      });
      dispatch(LayoutAct.triggerPersist());
    },
  ),
  closeProject: createThunk(
    '[dev-env] close project',
    ({ dispatch, state: { devEnv } }) => {
      dispatch(LayoutThunk.saveCurrentLayout({}));
      dispatch(Act.setProjectKey(null));
      dispatch(LayoutAct.setPersistKey(null));

      // Close file/app panels, but not docs panels.
      dispatch(LayoutThunk.closeMatchingPanels({
        predicate: (meta) =>
          meta.devEnvComponent === 'App'
          || !meta.devEnvComponent && !!meta.filename,
      }));

      // Remove files, models, scripts/styles
      Object.values(devEnv.file).forEach(({ key: filename }) =>
        dispatch(Thunk.removeFile({ filename })));
      
      dispatch(Act.resetFlags());
      forgetAppAndStore();
    },
  ),
  /**
   * Can create css module code/url as soon as scss file created.
   */
  createCssModule: createThunk(
    '[dev-env] create css module',
    ({ dispatch }, { filename }: { filename: string }) => {
      const code = getCssModuleCode(filename);
      const blobUrl = Dev.getBlobUrl(code);
      dispatch(Act.updateFile(filename, { cssModule: { code, blobUrl } } as Dev.StyleFile));
    },
  ),
  /**
   * Detect dependency cycles in transpiled js.
   * We don't support cycles because we use blob urls to resolve modules.
   */
  detectCodeDependencyCycles: createThunk(
    '[dev-env] detect code dependency cycles',
    ({ state: { devEnv } }, { filename, imports, exports }: {
      filename: string;
      imports: Dev.TsImportMeta[];
      exports: Dev.TsExportMeta[];
    }): null | Dev.CyclicDepError => {
      const file = devEnv.file as KeyedLookup<Dev.CodeFile>;
      const filenames = Object.keys(file);

      /** Dependencies are files that `filename` imports or exports */
      const moduleSpecs = imports.map(({ from }) => from.value)
        .concat(exports.filter(Dev.isTsExportDecl).map(({ from }) => from.value));
      const dependencies = PatchJs.moduleSpecsToCodeFilenames(filename, file, moduleSpecs)
        .map(filename => file[filename]);

      /** Files that import or export `filename`, and `filename` itself */
      const dependents = lookupFromValues(Object.values(file).filter(({ key, transpiled }) =>
        key === filename || (transpiled?.type === 'js' && (
          transpiled.importFilenames.includes(filename)
          || transpiled.exportFilenames.includes(filename)
        ))
      ));
      /**
       * Error iff adding this module creates a cycle:
       * some direct dependency of `filename` has
       * some direct dependent of `filename` as a transitive-dependency.
       */
      for (const dependencyFile of dependencies) {
        const error = PatchJs.traverseDeps(dependencyFile, file, dependents, filenames.length);
        if (error) {
          return {
            key: 'cyclic-dependency',
            path: dependencyFile.key, // TODO module specifier instead?
            dependent: error.dependent,
            resolved: Dev.withoutFileExtension(dependencyFile.key),
          };
        }
      }
      return null;
    },
  ),
  /**
   * Detect dependency cycles in scss, assuming they are `prefixed`,
   * providing stratification if successful.
   * We also detect invalid @import-module-specifier.
   */
  detectScssImportError: createThunk(
    '[dev-env] detect scss dependency cycles',
    ({ state: { devEnv } }, { filename }: { filename: string }): ScssImportsResult => {
      const files = pluck(devEnv.file, ({ ext }) => ext === 'scss') as KeyedLookup<Dev.PrefixedStyleFile>;
      const file = files[filename];

      const invalidImport = detectInvalidScssImport(filename, files);
      if (invalidImport) {
        return { key: 'error', errorKey: 'import-unknown', dependency: filename, inFilename: filename, fromFilename: invalidImport.value };
      }

      const dependencies = file.pathIntervals.map(({ value }) => files[Dev.resolveRelativePath(filename, value)]);
      const dependents = Object.values(files).filter(({ key, pathIntervals }) =>
        key === filename || pathIntervals.some(({ value }) => value === filename));

      const fileCount = Object.keys(files).length;
      for (const dependencyFile of dependencies) {
        const error = traverseScssDeps(dependencyFile, files, lookupFromValues(dependents), fileCount);
        if (error) {
          return { ...error, dependency: dependencyFile.key };
        }
      }

      const reachableScssFiles = Dev.getReachableScssFiles(filename, files);
      const stratification = stratifyScssFiles(reachableScssFiles);
      return { key: 'success', stratification };
    },
  ),
  fetchPackages: createThunk(
    '[dev-env] fetch packages',
    async ({ dispatch, state: { devEnv } }) => {
      const { packages } = devEnv.packagesManifest!;
      for (const [packageName, { files }] of Object.entries(packages)) {
        const loadedFiles = await Promise.all(files.map(async filePath => ({
          key: filePath,
          contents: await (await fetch(`/${filePath}`)).text(),
        })));
        dispatch(Act.addPackage({ key: packageName, file: lookupFromValues(loadedFiles) }))
      }
    },
  ),
  fetchPackagesManifest: createThunk(
    '[dev-env] fetch packages manifest',
    async ({ dispatch }): Promise<PackagesManifest> => {
      try {
        const response = await fetch(manifestWebPath);
        const manifest = await response.json();
        dispatch(Act.storePackagesManifest(manifest));
        return manifest;
      } catch (e) {
        console.error(e);
        throw Error(`Error fetching ${manifestWebPath}`);
      }
    },
  ),
  filenameToPanelKey: createThunk(
    '[dev-env] filename to panel key',
    ({ state: { devEnv } }, { filename }: { filename: string }) =>
      Object.values(devEnv.panelToMeta)
        .find((meta) => meta.panelType === 'file' && meta.filename === filename)?.key || null
  ),
  forgetCodeTranspilation: createThunk(
    '[dev-env] forget code transpilation',
    ({ dispatch, state: { devEnv } }, { filename }: { filename: string }) => {
      devEnv.file[filename]?.transpiled?.cleanups.forEach(cleanup => cleanup());
      dispatch(Act.updateFile(filename, { transpiled: null, pathIntervals: [] }));
    },
  ),
  /**
   * Display errors detected in transpiled javascript.
   */
  handleCodeAnalysis: createThunk(
    '[dev-env] handle code errors',
    async ({ dispatch, state: { devEnv } }, { filename, analyzed: { jsPathErrors, prevCyclicError }}: {
      filename: string;
      analyzed: Dev.AnalyzeNextCode;
    }) => {
      const { pathIntervals } = devEnv.file[filename];
      const modelKey = filenameToModelKey(filename);
      
      if (jsPathErrors.length) {
        console.log({ filename, jsPathErrors });
        const markers = Dev.getJsPathErrorMarkers(filename, jsPathErrors, pathIntervals);
        dispatch(EditorThunk.setModelMarkers({ modelKey, markers }));
        const cyclicError = jsPathErrors.find(isCyclicDepError);
        cyclicError && dispatch(Thunk.tryTranspileCodeModel({ filename: cyclicError.path, onlyIf: 'valid' }));
      } else {
        dispatch(EditorThunk.setModelMarkers({ modelKey, markers: [] }));
        if (prevCyclicError) {
          dispatch(Thunk.tryTranspileCodeModel({ filename: prevCyclicError.path, onlyIf: 'invalid' }));
        }
      }
    },
  ),
  /**
   * TODO improve
   */
  handleScssImportError: createThunk(
    '[dev-env] handle scss import error',
    ({ state: { devEnv } }, { filename, importError }: {
      filename: string;
      importError: SccsImportsError;
    }) => {
      console.error(`Scss import error for ${filename}: ${JSON.stringify(importError)}`);
      const { pathIntervals } = devEnv.file[filename] as Dev.StyleFile;
      if (importError.errorKey === 'import-unknown') {
        if (importError.dependency === filename) {
          console.log({ scssImportUnknown: pathIntervals.filter(({ value }) => value === importError.fromFilename) });
        } else {
          console.log({ scssTransitiveImportUnknown: pathIntervals.filter(({ value }) =>
            Dev.resolveRelativePath(filename, value) === importError.dependency) });
        }
        // dispatch(EditorThunk.setModelMarkers({ modelKey, markers: [] }));
      }
    },
  ),
  initialize: createThunk(
    '[dev-env] initialize',
    async ({ dispatch, getState }) => {
      await dispatch(Thunk.fetchPackagesManifest({}));
      await dispatch(Thunk.fetchPackages({}));

      const { projectKey } = getState().devEnv;
      projectKey && dispatch(Thunk.loadProject({ packageName: projectKey }));

      dispatch(Act.setInitialized());
    },
  ),
  loadProject: createThunk(
    '[dev-env] load project',
    ({ dispatch, state: { devEnv } }, { packageName, overwrite = false }: {
      packageName: string;
      /** Should we overwrite any saved files? */
      overwrite?: boolean;
    }) => {
      initializeRuntimeStore();
      storeAppInvalidSignaller(() => dispatch(Act.setAppValid(false)));

      dispatch(Act.setProjectKey(packageName));

      dispatch(Thunk.addFilesFromPackage({
        packageName,
        mode: overwrite ? 'overwrite-root' : 'restore-root',
      }));
      const { transitiveDeps } = devEnv.packagesManifest!.packages[packageName];
      for (const depPackageName of transitiveDeps) {
        dispatch(Thunk.addFilesFromPackage({ packageName: depPackageName }));
      }

      dispatch(LayoutThunk.restoreSavedLayout({
        layoutKey: Dev.packageNameToLayoutKey(packageName)
      }));
    },
  ),
  /**
   * To display app need to replace import/export module specifers in transpiled js by
   * valid urls. We use (a) an asset url for react, (b) blob urls for relative paths.
   */
  patchAllTranspiledCode: createThunk(
    '[dev-env] patch all transpiled code',
    async ({ dispatch, state: { devEnv } }, { rootFilename }: { rootFilename: string }) => {
      /**
       * Stratify transpiled javascript files and apply import/export patches.
       * We'll use code-intervals already stored in transpiled.imports.
       */
      const jsFiles = Dev.getReachableJsFiles(rootFilename, devEnv.file) as Dev.TranspiledCodeFile[];
      const stratification = PatchJs.stratifyJsFiles(jsFiles);
      const filenameToPatched = PatchJs.patchTranspiledJsFiles(devEnv.file, stratification);
        
      for (const [filename, { patchedCode, blobUrl }] of Object.entries(filenameToPatched)) {
        dispatch(Act.updateFile(filename, { esModule: { patchedCode, blobUrl } }));
      }
    },
  ),
  removeFile: createThunk(
    '[dev-env] remove files',
    ({ state: { devEnv }, dispatch }, { filename }: { filename: string }) => {
      const file = devEnv.file[filename];

      file.cleanups.forEach(cleanup => cleanup());
      file.transpiled?.cleanups.forEach((cleanup => cleanup()));
      if (file.ext !== 'scss' && file.esModule?.blobUrl) {
        URL.revokeObjectURL(file.esModule.blobUrl);
      }

      dispatch(Act.removeFile({ filename }));
      dispatch(EditorThunk.removeMonacoModel({ modelKey: filenameToModelKey(filename) }));

      if (file.ext === 'scss') {
        document.getElementById(Dev.filenameToStyleId(filename))?.remove();
      } else {
        document.getElementById(Dev.filenameToScriptId(filename))?.remove();
      }
    },
  ),
  resetProject: createThunk(
    '[dev-env] reset project',
    ({ state: { devEnv }, dispatch, getState }) => {
      const projectKey = devEnv.projectKey!;
      dispatch(Thunk.closeProject({}));
      dispatch(Thunk.loadProject({ packageName: projectKey, overwrite: true }));

      setTimeout(() => {// Trigger panel refresh
        const { nextConfig } = getState().layout;
        dispatch(LayoutAct.setNextConfig({ nextConfig: { ...nextConfig } }));
      });
    },
  ),
  saveFilesToDisk: createThunk(
    '[dev-env] save files to disk',
    ({ state: { devEnv } }) => {
      const filenameToContents = Object.entries(devEnv.file)
        .reduce<Record<string, string>>((agg, [filename, { contents }]) => ({
          ...agg, [filename]: contents,
        }), {});
      /**
       * TODO
       * - package.json
       * - tsconfig.json
       * - webpack.config.ts
       */
      const blob = new Blob([pretty(filenameToContents)], {type: 'text/plain;charset=utf-8'});
      FileSaver.saveAs(blob, 'project.json');
    },
  ),
  /** Initialize (debounced) transpilation of model contents on model change. */
  setupFileTranspile: createThunk(
    '[dev-env] setup code file transpile',
    ({ dispatch }, { modelKey, filename }: { modelKey: string; filename: string }) => {
      if (filename.endsWith('.d.ts')) {
        return; // No need to transpile *.d.ts
      }
      const transpileCode = Dev.isCodeFilename(filename)
        ? () => dispatch(Thunk.tryTranspileCodeModel({ filename }))
        : () => dispatch(Thunk.tryTranspileStyleModel({ filename }));
      const disposable = dispatch(EditorThunk.trackModelChange({ do: transpileCode, delayType: 'debounce', delayMs: 500, modelKey }));
      dispatch(Act.addFileCleanups(filename, [() => disposable.dispose()]));
    },
  ),
  /** Initialize (debounced) storage of model contents on model change. */
  setupRememberFileContents: createThunk(
    '[dev-env] setup remember file contents',
    ({ dispatch }, { filename, modelKey }: { filename: string; modelKey: string }) => {
      const storeFileContents = (contents: string) => dispatch(Act.updateFile(filename, { contents }));
      const disposable = dispatch(EditorThunk.trackModelChange({ do: storeFileContents, delayType: 'debounce', delayMs: 500, modelKey }));
      dispatch(Act.addFileCleanups(filename, [() => disposable.dispose()]));
    },
  ),
  testCyclicJsDependency: createThunk(
    '[dev-env] test cyclic dependency',
    async ({ dispatch, state: { devEnv } }, { filename, nextTranspiledJs }: { filename: string; nextTranspiledJs?: string }) => {
      const { imports, exports, jsErrors } = await dispatch(EditorThunk.computeJsImportExports({
        filename,
        code: nextTranspiledJs || devEnv.file[filename].transpiled!.dst,
      }));
      const cyclicDepError = dispatch(Thunk.detectCodeDependencyCycles({
        filename,
        imports,
        exports,
      })) as null | Dev.CyclicDepError;

      // console.log({ key: 'testCyclicJsDependency', filename, jsErrors, imports, exports });
      return {
        imports,
        exports,
        jsErrors: jsErrors.concat(cyclicDepError || []),
      };
    },
  ),
  tryPrefixStyleFile: createThunk(
    '[dev-env] try prefix style file',
    async ({ state: { devEnv, editor: e }, dispatch }, { filename }: { filename: string }) => {
      const { contents, prefixed } = devEnv.file[filename] as Dev.StyleFile;

      if (contents !== prefixed?.src) {
        e.syntaxWorker!.postMessage({ key: 'request-scss-prefixing', filename, scss: contents });
        const result = await awaitWorker('send-prefixed-scss', e.syntaxWorker!, ({ origScss }) => contents === origScss);

        if (result.prefixedScss) {
          const { prefixedScss, pathIntervals } = result;
          dispatch(Act.updateFile(filename, { pathIntervals, prefixed: { src: contents, dst: prefixedScss } }));
        } else {
          console.error({ prefixScssError: result });
          throw Error(result.error!);
        }
      }
    },
  ),
  /** Try to transpile a ts or tsx file. */
  tryTranspileCodeModel: createThunk(
    '[dev-env] try transpile code model',
    async ({ dispatch, state: { devEnv } }, { filename, onlyIf }: {
      filename: string;
      onlyIf?: 'valid' | 'invalid'; // Used to break cycles
    }) => {
      const currFile = devEnv.file[filename] as Dev.CodeFile;
      const isValid = Dev.isFileValid(currFile);
      if (onlyIf === 'valid' && !isValid || onlyIf === 'invalid' && isValid) {
        return;
      }
      
      const needsTranspile = currFile.transpiled?.src !== currFile.contents;
      const modelKey = filenameToModelKey(filename);
      const transpiled: TsTranspilationResult = currFile.transpiled && !needsTranspile
        ? { key: 'success', src: currFile.contents, js: currFile.transpiled.dst, typings: currFile.transpiled.typings }
        : await dispatch(EditorThunk.transpileTsMonacoModel({ modelKey }));

      if (transpiled.key !== 'success') {// Don't show import errors if transpile failed
        dispatch(EditorThunk.setModelMarkers({ modelKey, markers: [] }));
        dispatch(Thunk.forgetCodeTranspilation({ filename })); // Cleanliness
        return;
      }
      
      const { srcErrors } = await dispatch(Thunk.analyzeSrcCode({ filename }));
      if (srcErrors.length) {// We forget transpilation if have error in untranspiled code
        console.error({ filename, srcErrors });
        dispatch(EditorThunk.setModelMarkers({ modelKey, markers: srcErrors.map(e => Dev.getSrcErrorMarker(e)) }));
        return;
      }

      if (filename.endsWith('.d.ts')) {
        return;
      }

      const analyzed = await dispatch(Thunk.analyzeJsCode({ filename, nextTranspiledJs: transpiled.js }));

      dispatch(Thunk.updateCodeTranspilation({
        filename,
        src: transpiled.src,
        dst: analyzed.transformedJs, // not patched yet
        imports: analyzed.jsImports,
        exports: analyzed.jsExports,
        typings: transpiled.typings,
        jsPathErrors: analyzed.jsPathErrors,
      }));

      dispatch(Thunk.handleCodeAnalysis({ filename, analyzed }));
    },
  ),
  /**
   * Try to transpile scss.
   * TODO clean up
   */
  tryTranspileStyleModel: createThunk(
    '[dev-env] try transpile style model',
    async ({ dispatch, state: { devEnv }, getState }, { filename }: { filename: string }) => {
      try {
        // Ensure all scss files have been `prefixed` and compute `pathIntervals`
        const scssFiles = Object.values(devEnv.file).filter(({ ext }) => ext === 'scss');
        for (const { key: filename } of scssFiles)
          await dispatch(Thunk.tryPrefixStyleFile({ filename }));
      } catch (e) {
        console.error({ scssPrefixError: e });
        return;
      }

      const importsResult = dispatch(Thunk.detectScssImportError({ filename }));
      if (importsResult.key === 'error') {
        dispatch(Thunk.handleScssImportError({ filename, importError: importsResult }));
        return;
      }

      const file = getState().devEnv.file as KeyedLookup<Dev.PrefixedStyleFile>;
      const transpiled = await dispatch(EditorThunk.transpileScss({
        src: file[filename].prefixed.dst,
        files: importsResult.stratification.flatMap(x => x).map(filename => ({
          filename,
          contents: file[filename].prefixed.dst,
        })),
      }));

      if (transpiled.key === 'success') {
        // TODO clear markers matching tag
        // dispatch(EditorThunk.setModelMarkers({ modelKey, markers: [] }));
        dispatch(Act.storeStyleTranspilation(filename, {
          type: 'css',
          src: transpiled.src,
          dst: transpiled.dst,
          cleanups: [],
        }));
      } else {
        console.error({ sassJsTranspileError: transpiled }); // TODO
        // dispatch(EditorThunk.setModelMarkers({ modelKey, markers: [] }));
      }
    },
  ),
  tryUnmountAppInstance: createThunk(
    '[dev-env] unmount app instance',
    (_, { panelKey }: { panelKey: string }) => {
      // console.log('trying to unmount...', { panelKey, id: Dev.panelKeyToAppElId(panelKey) });
      unmountAppAt(Dev.panelKeyToAppElId(panelKey));
    },
  ),
  updateCodeTranspilation: createThunk(
    '[dev-env] update code transpilation',
    ({ dispatch, state: { devEnv } }, { filename, ...rest }: {
      filename: string;
      src: string;
      dst: string;
      typings: string;
      imports: Dev.TsImportMeta[];
      exports: Dev.TsExportMeta[];
      jsPathErrors: Dev.JsPathError[];
    }) => {
      devEnv.file[filename]?.transpiled?.cleanups.forEach(cleanup => cleanup());
      const typesFilename = filename.replace(/\.tsx?$/, '.d.ts');
      const disposable = dispatch(EditorThunk.addTypings({ filename: typesFilename, typings: rest.typings }));
      dispatch(Act.storeCodeTranspilation(filename, {
        type: 'js',
        ...rest,
        cleanups: [() => disposable.dispose()],
        importFilenames: PatchJs.moduleSpecsToCodeFilenames(filename, devEnv.file,
          rest.imports.map(({ from: path }) => path.value)),
        exportFilenames: PatchJs.moduleSpecsToCodeFilenames(filename, devEnv.file,
          rest.exports.filter(Dev.isTsExportDecl).map(({ from }) => from.value)),
      }));
    },
  ),
};

export type Thunk = ActionsUnion<typeof Thunk>;

export const reducer = (state = initialState, act: Action): State => {
  switch (act.type) {
    case '[dev-env] add app portal': return { ...state,
      appPortal: addToLookup({
        key: act.pay.panelKey,
        portalNode: act.pay.portalNode,
        rendered: false,
      }, state.appPortal),
    };
    case '[dev-env] add file cleanups': return { ...state,
      file: updateLookup(act.pay.filename, state.file, ({ cleanups: cleanupTrackers }) => ({
        cleanups: cleanupTrackers.concat(act.pay.cleanups),
      })),
    };
    case '[dev-env] add package': return { ...state,
      package: addToLookup(act.pay.newPackage, state.package),
    };
    case '[dev-env] app was valid': return { ...state,
      flag: { ...state.flag, appWasValid: true }
    };
    case '[dev-env] change panel meta': {
      const metaState = Dev.getDevPanelMetaState(state.panelToMeta[act.pay.panelKey]);
      return { ...state, panelToMeta: addToLookup(
        act.pay.to === 'app'
          ? { ...Dev.createDevPanelAppMeta(act.pay.panelKey), ...metaState }
          : act.pay.to ===  'doc'
            ? { ...Dev.createDevPanelDocMeta(act.pay.panelKey, act.pay.filename), ...metaState }
            : { ...Dev.createDevPanelFileMeta(act.pay.panelKey, act.pay.filename), ...metaState }
        , state.panelToMeta),
      };
    }
    case '[dev-env] close panel opener': return { ...state,
      panelOpener: null,
    };
    case '[dev-env] create app panel meta': return { ...state,
      panelToMeta: addToLookup(
        Dev.createDevPanelAppMeta(act.pay.panelKey), state.panelToMeta),
    };
    case '[dev-env] create code file': return { ...state,
      file: addToLookup({
        key: act.pay.filename,
        contents: act.pay.contents,
        ext: act.pay.filename.split('.').pop() as any, // no dot
        transpiled: null,
        pathIntervals: [],
        srcErrors: [],
        cleanups: [],
        esModule: null,
      }, state.file),
    };
    case '[dev-env] create doc panel meta': return { ...state,
      panelToMeta: addToLookup(
        Dev.createDevPanelDocMeta(act.pay.panelKey, act.pay.filename), state.panelToMeta)
    };
    case '[dev-env] create file panel meta': return { ...state,
      panelToMeta: addToLookup(
        Dev.createDevPanelFileMeta(act.pay.panelKey, act.pay.filename), state.panelToMeta)
    };
    case '[dev-env] create style file': return { ...state,
      file: addToLookup({
        key: act.pay.filename,
        contents: act.pay.contents,
        ext: 'scss',
        cleanups: [],
        transpiled: null,
        pathIntervals: [],
        srcErrors: [],
        prefixed: null,
        cssModule: null,
      } as Dev.StyleFile, state.file),
    };
    case '[dev-env] forget panel meta': return { ...state,
      panelToMeta: removeFromLookup(act.pay.panelKey, state.panelToMeta),
    };
    case '[dev-env] remove app portal': return { ...state,
      appPortal: removeFromLookup(act.pay.panelKey, state.appPortal),
    };
    case '[dev-env] remove file': return { ...state,
      file: removeFromLookup(act.pay.filename, state.file),
    };
    case '[dev-env] reset flags': return { ...state,
      flag: {
        ...state.flag,
        appValid: false,
        appWasValid: false,
        reducerValid: false,
      },
    };
    case '[dev-env] restrict app portals': return { ...state,
      appPortal: pluck(state.appPortal, ({ key }) => act.pay.panelKeys.includes(key)),
    };
    case '[dev-env] set app valid': return { ...state,
      flag: { ...state.flag, appValid: act.pay.isValid }
    };
    case '[dev-env] set initialized': return { ...state,
      flag: { ...state.flag, initialized: true },
    };
    case '[dev-env] set project key': return { ...state,
      projectKey: act.pay.projectKey,
    };
    case '[dev-env] set reducer valid': return { ...state,
      flag: { ...state.flag, reducerValid: act.pay.isValid }
    };
    case '[dev-env] set rendered app': return { ...state,
      appPortal: updateLookup(act.pay.panelKey, state.appPortal, () => ({
        rendered: true,
      })),
    };
    case '[dev-env] store packages manifest': return { ...state,
      packagesManifest: act.pay.manifest,
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
    case '[dev-env] update panel meta': return { ...state,
      panelToMeta: updateLookup(act.pay.panelKey, state.panelToMeta, act.pay.updates),
    };
    case '[dev-env] xor panel opener': return { ...state,
      panelOpener: state.panelOpener && (
        state.panelOpener.elementId === act.pay.elementId
        && state.panelOpener.panelKey === act.pay.panelKey
      ) ? null : act.pay,
    };
    default: return state || testNever(act);
  }
};

const bootstrapApp = createEpic(
  (action$, state$) => action$.pipe(
    filterActs(
      '[dev-env] store code transpilation',
      '[dev-env] app portal is ready',
    ),
    flatMap((act) => {
      const { file, flag: { appValid, reducerValid} } = state$.value.devEnv;

      if (act.type === '[dev-env] store code transpilation') {
        if (act.pay.filename.endsWith('.tsx')) {
          const reachableJsFiles = Dev.getReachableJsFiles(Dev.rootAppFilename, file);
          if (!reachableJsFiles.includes(file[act.pay.filename] as Dev.CodeFile)) {
            return []; // Ignore files unreachable from app.tsx
          }
          if (!reducerValid) {
            return []; // Don't render under state is 'valid'
          } else if (reachableJsFiles.every((f) => Dev.isFileValid(f))) {
            // All reachable code locally valid so try bootstrap app
            return [Thunk.bootstrapApps({})];
          } else if (appValid) {
            return [Act.setAppValid(false)];
          }
        }
      } else if (act.type === '[dev-env] app portal is ready') {
        if (appValid) {
          return [Thunk.bootstrapAppInstance({ panelKey: act.args.panelKey })];
        }
      }
      return [];
    }),
  ),
);

const bootstrapReducers = createEpic(
  (action$, state$) => action$.pipe(
    filterActs('[dev-env] store code transpilation'),
    flatMap((act) => {
      if (act.type === '[dev-env] store code transpilation') {
        if (act.pay.filename.endsWith('.ts')) {
          const { file, flag: { reducerValid } } = state$.value.devEnv;

          const reachableJsFiles = Dev.getReachableJsFiles(Dev.rootReducerFilename, file);
          if (!reachableJsFiles.includes(file[act.pay.filename] as Dev.CodeFile)) {
            return []; // Ignore files unreachable from reducer.ts
          }
          const invalidFile = reachableJsFiles.find((f) => !Dev.isFileValid(f));
          if (invalidFile) {// DEBUG
            // console.log({ foundInvalid: invalid.key, validities: reachableJsFiles.map(x => ({ filename: x.key, valid: Dev.isFileValid(x) }))
            // return [Thunk.tryTranspileCodeModel({ filename: invalid.key, onlyIf: 'valid' })];
          }
          if (!invalidFile) {
            return [// All reachable code locally valid, so replace reducer
              Thunk.bootstrapRootReducer({}),
            ];
          } else if (reducerValid) {
            return [Act.setReducerValid(false)];
          }
        }
      }
      return [];
    }),
  ),
);

/**
 * Currently we append a <style> for *.scss, even if unused by App.
 * We also attempt to retranspile any immediate ancestor (i.e. parent).
 */
const bootstrapStyles = createEpic(
  (action$, state$) => action$.pipe(
    filterActs('[dev-env] store style transpilation'),
    flatMap(({ pay: { filename } }) => {
      const file = pluck(state$.value.devEnv.file, ({ ext }) => ext === 'scss') as KeyedLookup<Dev.PrefixedStyleFile>;
      const parentFiles = Object.values(file).filter(({ key, pathIntervals }) =>
        key !== filename && pathIntervals.some(({ value }) => value === `./${filename}`));
      return [
        Thunk.bootstrapStyles({ filename }),
        ...parentFiles.map(({ key }) => Thunk.tryTranspileStyleModel({ filename: key })),
      ];
    }),
  ),
);

const handlePanelOpenerChange = createEpic(
  (action$, state$) => action$.pipe(
    filterActs(
      '[layout] panel closed',
      '[layout] panel shown',
      '[layout] set next config',
    ),
    flatMap((act) => {
      const { devEnv: { panelOpener } } = state$.value;
      if (!panelOpener) {
        return [];
      }
      if (act.type === '[layout] panel closed') {
        if (act.pay.panelKey === panelOpener.panelKey && !act.pay.siblingKeys.length) {
          return [Act.closePanelOpener()];
        }
      } else if (act.type === '[layout] panel shown') {
        if (
          panelOpener.panelKey !== act.pay.panelKey
          && act.pay.siblingKeys.includes(panelOpener.panelKey)
          || panelOpener.siblingKeys.includes(act.pay.panelKey)
        ) {
          return [Act.xorPanelOpener({
            panelKey: act.pay.panelKey,
            elementId:  panelOpener.elementId,
            siblingKeys: act.pay.siblingKeys,
          })];
        }
      } else if (act.type === '[layout] set next config') {
        return [Act.closePanelOpener()];
      }
      return [];
    }),
  ),
);

const handlePanelInitialize = createEpic(
  (action$, state$) => action$.pipe(
    filterActs(
      '[layout] panel created', // initialized
      '[dev-env] change panel meta', // reinitialized
    ),
    flatMap((act) => {
      const { panelKey } = act.pay;
      if (act.type === '[layout] panel created') {
        const { file } = state$.value.devEnv;
        if (Dev.isAppPanel(act.pay.panelMeta)) {
          return [LayoutThunk.setPanelTitle({ panelKey, title: 'App' })];
        } else if (Dev.isFilePanel(act.pay.panelMeta)) {
          const { filename } = act.pay.panelMeta;
          return [LayoutThunk.setPanelTitle({ panelKey, title: Dev.filenameToPanelTitle(filename) })];
        }
      } else {
        return [LayoutThunk.setPanelTitle({ panelKey,
          title: act.pay.to === 'app' ? 'App' : Dev.filenameToPanelTitle(act.pay.filename),
        })];
      }
      return [];
    }),
  ),
);

const initializeFileSystem = createEpic(
  (action$, state$) => action$.pipe(
    filterActs('persist/REHYDRATE' as any), // Also triggered on change page
    filter(_ => typeof window !== 'undefined' && !state$.value.devEnv.flag.initialized),
    map(() => Thunk.initialize({})),
  ),
);

const initializeMonacoModels = createEpic(
  (action$, state$) => action$.pipe(
    filterActs(
      '[editor] set monaco loaded',
      '[dev-env] set initialized',
      '[dev-env] load project', // Perhaps only need this
    ),
    filter((_) =>
      state$.value.editor.monacoLoaded
      && state$.value.devEnv.flag.initialized
    ),
    flatMap((_) => {
      return [
          ...Object.values(state$.value.devEnv.file).flatMap((file) => [
            EditorThunk.ensureMonacoModel({ filename: file.key, code: file.contents }),
            // Initial transpile when initialized
            ...file.ext === 'scss'
              ? [Thunk.tryTranspileStyleModel({ filename: file.key })]
              : [Thunk.tryTranspileCodeModel({ filename: file.key })]
          ]),
        ]
      }
    ),
  ),
);

const manageAppPortals = createEpic(
  (action$, state$) => action$.pipe(
    filterActs(
      '[dev-env] create app panel meta',
      '[dev-env] change panel meta',
      '[layout] panel closed', // App explicitly closed
    ),
    flatMap((act) => {
      const { panelKey } = act.pay;
      if (act.type === '[dev-env] create app panel meta') {
        if (!state$.value.devEnv.appPortal[panelKey]) {
          const portalNode = portals.createHtmlPortalNode();
          portalNode.element.style.overflow = 'auto';
          return [Act.addAppPortal(panelKey, portalNode)];
        }
        return [];
      } else if (act.type === '[dev-env] change panel meta') {
        if (act.pay.to === 'app') {
          const portalNode = portals.createHtmlPortalNode();
          portalNode.element.style.overflow = 'auto';
          return [Act.addAppPortal(panelKey, portalNode)];
        } else {
          return [Act.removeAppPortal(panelKey)];
        }
      } else {
        return [Act.removeAppPortal(panelKey)];
      }
    })
  ),
);

const resizeMonacoWithPanel = createEpic(
  (action$, state$) =>
    action$.pipe(
      filterActs('[layout] panel resized'),
      filter(({ pay: { panelKey } }) =>
        !!state$.value.editor.editor[Dev.panelKeyToEditorKey(panelKey)]),
      map(({ pay: { panelKey } }) =>
        EditorThunk.resizeEditor({ editorKey: Dev.panelKeyToEditorKey(panelKey) })),
    ));

const trackCodeFileContents = createEpic(
  (action$, state$) => action$.pipe(
    filterActs('[editor] store monaco model'),
    flatMap(({ pay: { model, filename, modelKey } }) => {
      const { file } = state$.value.devEnv;
      if (file[filename]) {
        // Initially load file contents
        model.setValue(file[filename].contents);
        return [
          ...(file[filename].ext === 'scss'
            ? [Thunk.createCssModule({ filename })] : []),
          // Setup tracking
          Thunk.setupRememberFileContents({ modelKey, filename }),
          Thunk.setupFileTranspile({ modelKey, filename }),
        ];
      }
      console.warn(`Ignored file "${filename}" (not found in state)`);
      return [];
    }),
  ),
);

export const epic = combineEpics(
  bootstrapApp,
  bootstrapReducers,
  bootstrapStyles,
  handlePanelInitialize,
  handlePanelOpenerChange,
  initializeFileSystem,
  initializeMonacoModels,
  manageAppPortals,
  resizeMonacoWithPanel,
  trackCodeFileContents,
);
