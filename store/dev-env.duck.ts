import { combineEpics } from 'redux-observable';
import { map, filter, flatMap } from 'rxjs/operators';
import * as portals from 'react-reverse-portal';

import { renderAppAt, storeAppFromBlobUrl, unmountAppAt, initializeRuntimeStore, replaceRootReducerFromBlobUrl, updateThunkLookupFromBlobUrl } from '@public/render-app';
import RefreshRuntime from '@public/es-react-refresh/runtime';

import { createAct, ActionsUnion, addToLookup, removeFromLookup, updateLookup, ReduxUpdater, redact } from '@model/store/redux.model';
import { KeyedLookup, testNever, lookupFromValues, pluck } from '@model/generic.model';
import { createThunk, createEpic } from '@model/store/root.redux.model';
import * as CodeExample from '@model/code/examples';
import * as Dev from '@model/code/dev-env.model';
import { TsTranspilationResult, filenameToModelKey } from '@model/monaco/monaco.model';
import * as PatchJs from '@model/code/patch-js-imports';
import { detectInvalidScssImport, ScssImportsResult, traverseScssDeps, stratifyScssFiles, SccsImportsError } from '@model/code/handle-scss-imports';
import { getCssModuleCode } from '@model/code/css-module';
import { traverseGlConfig, GoldenLayoutConfig } from '@model/layout/layout.model';
import { CustomPanelMetaKey } from '@model/layout/example-layout.model';
import { isCyclicDepError } from '@model/code/dev-env.model';
import { awaitWorker } from '@worker/syntax/worker.model';

import { filterActs } from './reducer';
import { Thunk as EditorThunk } from './editor.duck';
import { Thunk as LayoutThunk, Act as LayoutAct } from './layout.duck';

export interface State {  
  /** So can persist App instances across site */
  appPortal: KeyedLookup<Dev.AppPortal>;
  /**
   * True iff all code reachable from app.tsx was deemed
   * collectively valid after most recent transpilation.
   */
  appValid: boolean;
  /** Has app ever been valid? */
  appWasValid: boolean;
  /** File lookup. */
  file: KeyedLookup<Dev.FileState>;
  initialized: boolean;
  /** Mirrors layout.panel */
  panelToMeta: KeyedLookup<Dev.DevPanelMeta>;
  /**
   * True iff all code reachable from reducer.ts was deemed
   * collectively valid after most recent transpilation.
   */
  reducerValid: boolean;
}

const initialState: State = {
  appPortal: {},
  appValid: false,
  appWasValid: false,
  file: {},
  initialized: false,
  panelToMeta: {},
  reducerValid: false,
};

export const Act = {
  addAppPortal: (panelKey: string, portalNode: portals.HtmlPortalNode) =>
    createAct('[dev-env] add app portal', { panelKey, portalNode: redact(portalNode) }),
  addFileCleanups: (filename: string, cleanups: (() => void)[]) =>
    createAct('[dev-env] add file cleanups', { filename, cleanups }),
  appWasValid: () =>
    createAct('[dev-env] app was valid', {}),
  changePanelMeta: (panelKey: string, input: (
    | { to: 'app' }
    | { to: 'doc'; filename: string }
    | { to: 'file'; filename: string }
  )) => createAct('[dev-env] change panel meta', { panelKey, ...input }),
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
  deleteFile: (input: { filename: string }) =>
    createAct('[dev-env] remove file', input),
  forgetPanelMeta: (input: { panelKey: string }) =>
    createAct('[dev-env] forget panel meta', input),
  initialized: () =>
    createAct('[dev-env] initialized', {}),
  rememberAppValid: (isValid: boolean) =>
    createAct('[dev-env] remember app valid', { isValid }),
  rememberReducerValid: (isValid: boolean) =>
    createAct('[dev-env] remember reducer valid', { isValid }),
  rememberRenderedApp: (panelKey: string) =>
    createAct('[dev-env] remember rendered app', { panelKey }),
  removeAppPortal: (panelKey: string) =>
    createAct('[dev-env] remove app portal', { panelKey }),
  restrictAppPortals: (input: { panelKeys: string[] }) =>
    createAct('[dev-env] restrict app portals', input),
  storeCodeTranspilation: (filename: string, transpilation: Dev.CodeTranspilation) =>
    createAct('[dev-env] store code transpilation', { filename, transpilation }),
  storeStyleTranspilation: (filename: string, transpilation: Dev.StyleTranspilation) =>
    createAct('[dev-env] store style transpilation', { filename, transpilation }),
  updateFile: (filename: string, updates: Partial<Dev.FileState>) =>
    createAct('[dev-env] update file', { filename, updates }),
  updatePanelMeta: (panelKey: string, updates: ReduxUpdater<Dev.DevPanelMeta>) =>
    createAct('[dev-env] update panel meta', { panelKey, updates }),
};

export type Action = ActionsUnion<typeof Act>;

export const Thunk = {
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
        dispatch(Act.rememberRenderedApp(panelKey));
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
        dispatch(Act.rememberAppValid(false));
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
      Object.values(devEnv.panelToMeta).filter(({ panelType }) => panelType === 'app')
        .forEach(({ key: panelKey }) => dispatch(Thunk.bootstrapAppInstance({ panelKey })));
  
      dispatch(Act.rememberAppValid(true));
      !getState().devEnv.appWasValid && dispatch(Act.appWasValid());
    },
  ),
  bootstrapRootReducer: createThunk(
    '[dev-env] bootstrap root reducer',
    async ({ dispatch, getState }) => {

      // We verify dependencies are acyclic
      const { jsErrors } = await dispatch(Thunk.testCyclicJsDependency({ filename: Dev.rootReducerFilename }));
      if (jsErrors.find(isCyclicDepError)) {
        console.error('Root reducer bootstrap failed due to cyclic dependency');
        dispatch(Act.rememberReducerValid(false));
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

      dispatch(Act.rememberReducerValid(true));
      if (!devEnv.appWasValid) {
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
        // console.log({ filename, handlingJsErrors: jsPathErrors });
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
    ({ dispatch, state: { devEnv } }) => {
      initializeRuntimeStore();

      /**
       * TEMP provide demo files.
       */
      !devEnv.file[Dev.rootAppFilename]?.contents &&
        dispatch(Act.createCodeFile({ filename: Dev.rootAppFilename, contents: CodeExample.exampleTsx3 }));
      !devEnv.file['module/core/util.ts']?.contents &&
        dispatch(Act.createCodeFile({ filename: 'module/core/util.ts', contents: CodeExample.moduleCoreUtilTs }));
      !devEnv.file['reducer.ts']?.contents &&
        dispatch(Act.createCodeFile({ filename: 'reducer.ts', contents: CodeExample.defaultReducerTs }));
      !devEnv.file['module/core/redux.model.ts']?.contents &&
        dispatch(Act.createCodeFile({ filename: 'module/core/redux.model.ts', contents: CodeExample.moduleCoreReduxModelTs }));
      !devEnv.file['module/core/custom-types.d.ts']?.contents &&
        dispatch(Act.createCodeFile({ filename: 'module/core/custom-types.d.ts', contents: CodeExample.moduleCoreCustomTypesDTs }));
      !devEnv.file['store/test.duck.ts']?.contents &&
        dispatch(Act.createCodeFile({ filename: 'store/test.duck.ts', contents: CodeExample.defaultTestDuckTs }));
      !devEnv.file['index.scss']?.contents &&
        dispatch(Act.createStyleFile({ filename: 'index.scss', contents: CodeExample.exampleScss1 }));
      !devEnv.file['other.scss']?.contents &&
        dispatch(Act.createStyleFile({ filename: 'other.scss', contents: CodeExample.exampleScss2 }));

      dispatch(Act.initialized());
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
  /**
   * Analyze source code, storing errors and also module specifier code-intervals,
   * so can source-map errors found in transpiled js (always tied to an import/export).
   */
  analyzeSrcCode: createThunk(
    '[dev-env] analyze code file src',
    async ({ dispatch }, { filename }: { filename: string }) => {
      const { imports, exports, srcErrors } = await dispatch(EditorThunk.computeTsImportExports({ filename }));
      console.log({
        key: 'analyzeSrcCode',
        filename,
        srcErrors,
        imports,
        exports
      });
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
  /** Initialize (debounced) storage of model contents on model change. */
  setupRememberFileContents: createThunk(
    '[dev-env] setup remember file contents',
    ({ dispatch }, { filename, modelKey }: { filename: string; modelKey: string }) => {
      const storeFileContents = (contents: string) => dispatch(Act.updateFile(filename, { contents }));
      const disposable = dispatch(EditorThunk.trackModelChange({ do: storeFileContents, delayType: 'debounce', delayMs: 500, modelKey }));
      dispatch(Act.addFileCleanups(filename, [() => disposable.dispose()]));
    },
  ),
  /** Initialize (debounced) transpilation of model contents on model change. */
  setupFileTranspile: createThunk(
    '[dev-env] setup code file transpile',
    ({ dispatch }, { modelKey, filename }: { modelKey: string; filename: string }) => {
      if (filename.endsWith('.d.ts')) {
        return; // No need to transpile *.d.ts
      }
      const transpileCode = /\.tsx?$/.test(filename)
        ? () => dispatch(Thunk.tryTranspileCodeModel({ filename }))
        : () => dispatch(Thunk.tryTranspileStyleModel({ filename }));
      const disposable = dispatch(EditorThunk.trackModelChange({ do: transpileCode, delayType: 'debounce', delayMs: 500, modelKey }));
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

      console.log({ key: 'testCyclicJsDependency', filename, jsErrors, imports, exports });
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
      if (srcErrors.length) {
        // console.error({ filename, srcErrors });
        dispatch(EditorThunk.setModelMarkers({ modelKey, markers: srcErrors.map(e => Dev.getSrcErrorMarker(e)) }));
        return; // Forget transpilation if have source error
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
    case '[dev-env] add file cleanups': return { ...state,
      file: updateLookup(act.pay.filename, state.file, ({ cleanups: cleanupTrackers }) => ({
        cleanups: cleanupTrackers.concat(act.pay.cleanups),
      })),
    };
    case '[dev-env] add app portal': return { ...state,
      appPortal: addToLookup({
        key: act.pay.panelKey,
        portalNode: act.pay.portalNode,
        rendered: false,
      }, state.appPortal),
    };
    case '[dev-env] app was valid': return { ...state,
      appWasValid: true,
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
    case '[dev-env] initialized': return { ...state,
      initialized: true,
    };
    case '[dev-env] remember app valid': return { ...state,
      appValid: act.pay.isValid,
    };
    case '[dev-env] remember reducer valid': return { ...state,
      reducerValid: act.pay.isValid,
    };
    case '[dev-env] remember rendered app': return { ...state,
      appPortal: updateLookup(act.pay.panelKey, state.appPortal, () => ({
        rendered: true,
      })),
    };
    case '[dev-env] remove app portal': return { ...state,
      appPortal: removeFromLookup(act.pay.panelKey, state.appPortal),
    };
    case '[dev-env] remove file': return { ...state,
      file: removeFromLookup(act.pay.filename, state.file),
    };
    case '[dev-env] restrict app portals': return { ...state,
      appPortal: pluck(state.appPortal, ({ key }) => act.pay.panelKeys.includes(key)),
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
    default: return state || testNever(act);
  }
};

const bootstrapApp = createEpic(
  (action$, state$) => action$.pipe(
    filterActs(
      '[dev-env] store code transpilation',
      '[dev-env] app portal is ready',
      '[dev-env] change panel meta',
    ),
    flatMap((act) => {
      const { file, appValid, reducerValid } = state$.value.devEnv;

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
            return [Act.rememberAppValid(false)];
          }
        }
      } else if (act.type === '[dev-env] app portal is ready') {
        if (appValid) {
          return [Thunk.bootstrapAppInstance({ panelKey: act.args.panelKey })];
        }
      } else if (act.type === '[dev-env] change panel meta') {
        if (act.pay.to === 'file' || act.pay.to === 'doc') {
          return [Thunk.tryUnmountAppInstance({ panelKey: act.pay.panelKey })];
        }
      }
      return [];
    }),
  ),
);

const bootstrapReducers = createEpic(
  (action$, state$) => action$.pipe(
    filterActs(
      '[dev-env] store code transpilation',
    ),
    flatMap((act) => {
      if (act.type === '[dev-env] store code transpilation') {
        if (act.pay.filename.endsWith('.ts')) {
          const { file, reducerValid } = state$.value.devEnv;

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
            return [Act.rememberReducerValid(false)];
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

const initializeFileSystem = createEpic(
  (action$, _state$) => action$.pipe(
    filterActs('persist/REHYDRATE' as any),
    map(() => Thunk.initialize({})),
  ),
);

const initializeMonacoModels = createEpic(
  (action$, state$) => action$.pipe(
    filterActs(
      '[editor] set monaco loaded',
      '[editor] set global types loaded',
    ),
    filter((_) =>
      state$.value.editor.monacoLoaded
      && state$.value.editor.globalTypesLoaded
    ),
    flatMap(() => [
      ...Object.values(state$.value.devEnv.file).flatMap((file) => [
        EditorThunk.ensureMonacoModel({ filename: file.key, code: file.contents }),
        // Initial transpile
        ...file.ext === 'scss'
          ? [Thunk.tryTranspileStyleModel({ filename: file.key })]
          : !file.key.endsWith('.d.ts')
            ? [Thunk.tryTranspileCodeModel({ filename: file.key })]
            : []
      ]),
    ]
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
          portalNode.element.style.height = '100%';
          return [Act.addAppPortal(panelKey, portalNode)];
        }
        return [];
      } else if (act.type === '[dev-env] change panel meta') {
        if (act.pay.to === 'app') {
          const portalNode = portals.createHtmlPortalNode();
          portalNode.element.style.height = '100%';
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

const onChangePanel = createEpic(
  (action$, state$) => action$.pipe(
    filterActs(
      '[layout] panel created',
      '[dev-env] change panel meta',
    ),
    flatMap((act) => {
      const { panelKey } = act.pay;
      if (act.type === '[layout] panel created') {
        const { file } = state$.value.devEnv;
        if (Dev.isAppPanel(act.pay.panelMeta)) {
          return [LayoutThunk.setPanelTitle({ panelKey, title: 'App' })];
        } else if (Dev.isFilePanel(act.pay.panelMeta)) {
          const { filename } = act.pay.panelMeta;
          return [
            LayoutThunk.setPanelTitle({ panelKey, title: filename }),
            ...(file[filename] ? [] : [Act.createCodeFile({ filename, contents: '' })]),
          ];
        }
      } else {
        return [LayoutThunk.setPanelTitle({
          panelKey,
          title: act.pay.to === 'app' ? 'App' : act.pay.filename,
        })];
      }
      return [];
    }),
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
  initializeFileSystem,
  initializeMonacoModels,
  manageAppPortals,
  onChangePanel,
  resizeMonacoWithPanel,
  trackCodeFileContents,
);
