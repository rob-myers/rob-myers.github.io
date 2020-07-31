import { combineEpics } from 'redux-observable';
import { map, filter, flatMap } from 'rxjs/operators';
import * as portals from 'react-reverse-portal';

import { renderAppAt, storeAppFromBlobUrl, unmountAppAt, initializeRuntimeStore, replaceRootReducerFromBlobUrl, updateThunkLookupFromBlobUrl, forgetAppAndStore, storeAppInvalidSignaller } from '@public/render-app';
import RefreshRuntime from '@public/es-react-refresh/runtime';

import { createAct, ActionsUnion, addToLookup, removeFromLookup, updateLookup, ReduxUpdater, redact, createThunk, createEpic } from '@model/store/redux.model';
import { KeyedLookup, testNever, lookupFromValues, pluck, pretty } from '@model/generic.model';
import * as Dev from '@model/dev-env/dev-env.model';
import { TsTranspilationResult, filenameToModelKey } from '@model/monaco/monaco.model';
import * as PatchJs from '@model/dev-env/patch-js-imports';
import { detectInvalidScssImport, ScssImportsResult, traverseScssDeps, stratifyScssFiles, SccsImportsError } from '@model/dev-env/handle-scss-imports';
import { getCssModuleCode } from '@model/dev-env/css-module';
import { isCyclicDepError } from '@model/dev-env/dev-env.model';
import { manifestWebPath, PackagesManifest } from '@model/dev-env/manifest.model';
import { awaitWorker } from '@worker/syntax/worker.model';

import { filterActs } from './reducer';
import { Thunk as EditorThunk } from './editor.duck';

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
  };
  /** Loaded from folders in public/package. */
  package: KeyedLookup<Dev.PackageData>;
  /** Parsed from public/package/manifest.json */
  packagesManifest: null | PackagesManifest;
  /** Mirrors layout.panel, permitting us to change panel */
  panelToMeta: KeyedLookup<Dev.DevPanelMeta>;
  panelOpener: null | PanelOpener;
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
  },
  package: {},
  packagesManifest: null,
  panelOpener: null,
  panelToMeta: {},
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
  createAppPanelMeta: (input: { panelKey: string }) =>
    createAct('[dev-env] create app panel meta', input),
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
  updatePackageMeta: (panelKey: string, updates: ReduxUpdater<Dev.PackageData>) =>
    createAct('[dev-env] update package meta', { panelKey, updates }),
};

export type Action = ActionsUnion<typeof Act>;

export const Thunk = {
  /**
   * Given file data previously fetched and stored in `devEnv.package[packageName]`,
   * create respective files in `devEnv.file`. The latter files have respective monaco
   * models and are retranspiled on change.
   */
  addFilesFromPackage: createThunk(
    '[dev-env] add files from package',
    async ({ dispatch, state: { devEnv } }, { packageName, overwrite }: {
      packageName: string;
      /** If we don't overwrite we attempt to restore saved files */
      overwrite: boolean;
    }) => {
      let filesToCreate = [] as { filename: string; contents: string }[];

      if (!overwrite) {
        Object.values(devEnv.saved[packageName].file)
          .forEach(({ key: filename, contents }) => filesToCreate.push({ filename, contents }));
      } else {
        Object.values(devEnv.package[packageName].file).forEach(({ key, contents }) =>
          filesToCreate.push({ filename: key, contents }));
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
   * Analyze ts/tsx source code, storing errors and also module specifier code-intervals,
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
       * because later on we'll patch code-intervals using computed `imports` and `exports`.
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
       * All reachable files are now transpiled, so can now properly test for cycles.
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
  closeProject: createThunk(
    '[dev-env] close project',
    ({ dispatch, state: { devEnv } }) => {
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
          touched: false,
        })));
        dispatch(Act.addPackage({
          key: packageName,
          file: lookupFromValues(loadedFiles),
          loaded: false,
        }));
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
          console.log({
            scssImportUnknown: pathIntervals.filter(({ value }) => value === importError.fromFilename),
          });
        } else {
          console.log({
            scssTransitiveImportUnknown: pathIntervals.filter(({ value }) =>
              Dev.resolveRelativePath(filename, value) === importError.dependency),
          });
        }
      }
    },
  ),
  initialize: createThunk(
    '[dev-env] initialize',
    async ({ dispatch, getState }) => {
      await dispatch(Thunk.fetchPackagesManifest({}));
      await dispatch(Thunk.fetchPackages({}));

      // const projectKey = 'intro';
      // dispatch(Thunk.loadProject({ packageName: projectKey }));

      dispatch(Act.setInitialized());
    },
  ),
  loadPackage: createThunk(
    '[dev-env] load package',
    ({ dispatch, state: { devEnv } }, { packageName, overwrite = false }: {
      packageName: string;
      /** Should we overwrite any saved files? */
      overwrite?: boolean;
    }) => {
      initializeRuntimeStore();
      storeAppInvalidSignaller(() => dispatch(Act.setAppValid(false)));

      dispatch(Thunk.addFilesFromPackage({ packageName, overwrite }));
      const { transitiveDeps } = devEnv.packagesManifest!.packages[packageName];
      for (const depPackageName of transitiveDeps) {
        dispatch(Thunk.addFilesFromPackage({ packageName: depPackageName, overwrite }));
      }

      dispatch(Act.updatePackageMeta(packageName, () => ({ loaded: true })));
    },
  ),
  /**
   * To display app need to replace import/export module specifers in transpiled js by
   * valid urls. We use (a) an asset url for react/redux/react-redux, (b) blob urls for relative paths.
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
        URL.revokeObjectURL(file.esModule.blobUrl); // Has no effect if imported
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
  resetPackage: createThunk(
    '[dev-env] reset project',
    ({ dispatch }, { packageName }: { packageName: string }) => {
      dispatch(Thunk.closeProject({}));
      dispatch(Thunk.loadPackage({ packageName, overwrite: true }));
    },
  ),
  /** Initialize debounced transpilation of model contents on model change. */
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
  /** Initialize debounced storage of model contents on model change. */
  setupRememberFileContents: createThunk(
    '[dev-env] setup remember file contents',
    ({ dispatch }, { filename, modelKey }: { filename: string; modelKey: string }) => {
      const storeFileContents = (contents: string) => dispatch(Act.updateFile(filename, { contents }));
      const disposable = dispatch(EditorThunk.trackModelChange({
        do: storeFileContents,
        delayType: 'debounce',
        delayMs: 500,
        modelKey,
      }));
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
    case '[dev-env] update package meta': return { ...state,
      package: updateLookup(act.pay.panelKey, state.package, act.pay.updates),
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
      const { file, flag: { appValid } } = state$.value.devEnv;

      if (act.type === '[dev-env] store code transpilation') {
        if (act.pay.filename.endsWith('.tsx')) {
          const reachableJsFiles = Dev.getReachableJsFiles(Dev.rootAppFilename, file);
          if (!reachableJsFiles.includes(file[act.pay.filename] as Dev.CodeFile)) {
            return []; // Ignore files unreachable from app.tsx
          }
          if (reachableJsFiles.every((f) => Dev.isFileValid(f))) {
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

const initializeFileSystem = createEpic(
  (action$, state$) => action$.pipe(
    filterActs('persist/REHYDRATE' as any), // Also triggered on change page
    filter(_ => typeof window !== 'undefined' && !state$.value.devEnv.flag.initialized),
    map(() => Thunk.initialize({})),
  ),
);

/**
 * TODO only initialize new ones
 */
const initializeMonacoModels = createEpic(
  (action$, state$) => action$.pipe(
    filterActs(
      '[editor] set monaco loaded',
      '[dev-env] set initialized',
      '[dev-env] load package', // Perhaps only need this
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
      // '[dev-env] change panel meta',
      // '[layout] panel closed', // App explicitly closed
    ),
    flatMap((act) => {
      const { panelKey } = act.pay;
      if (act.type === '[dev-env] create app panel meta') {
        if (!state$.value.devEnv.appPortal[panelKey]) {
          const portalNode = portals.createHtmlPortalNode();
          portalNode.element.style.overflow = 'auto';
          return [Act.addAppPortal(panelKey, portalNode)];
        }
      } 
      return [];
      // else if (act.type === '[dev-env] change panel meta') {
      //   if (act.pay.to === 'app') {
      //     const portalNode = portals.createHtmlPortalNode();
      //     portalNode.element.style.overflow = 'auto';
      //     return [Act.addAppPortal(panelKey, portalNode)];
      //   } else {
      //     return [Act.removeAppPortal(panelKey)];
      //   }
      // } else {
      //   return [Act.removeAppPortal(panelKey)];
      // }
    })
  ),
);

// const resizeMonacoWithPanel = createEpic(
//   (action$, state$) =>
//     action$.pipe(
//       filterActs('[layout] panel resized'),
//       filter(({ pay: { panelKey } }) =>
//         !!state$.value.editor.editor[Dev.panelKeyToEditorKey(panelKey)]),
//       map(({ pay: { panelKey } }) =>
//         EditorThunk.resizeEditor({ editorKey: Dev.panelKeyToEditorKey(panelKey) })),
//     ));

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
  bootstrapStyles,
  initializeFileSystem,
  initializeMonacoModels,
  manageAppPortals,
  trackCodeFileContents,
);
