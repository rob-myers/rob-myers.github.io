import { combineEpics } from 'redux-observable';
import { map, filter, flatMap } from 'rxjs/operators';
import * as portals from 'react-reverse-portal';

import { renderAppAt, storeAppFromBlobUrl, unmountAppAt } from '@public/render-app';
import RefreshRuntime from '@public/es-react-refresh/runtime';

import { createAct, ActionsUnion, addToLookup, removeFromLookup, updateLookup, ReduxUpdater, redact } from '@model/store/redux.model';
import { KeyedLookup, testNever, lookupFromValues, pluck } from '@model/generic.model';
import { createThunk, createEpic } from '@model/store/root.redux.model';
import { exampleTsx3, exampleScss1, exampleTs1, exampleScss2 } from '@model/code/examples';
import * as Dev from '@model/code/dev-env.model';
import { TsTranspilationResult, filenameToModelKey } from '@model/monaco/monaco.model';
import * as PatchJs from '@model/code/patch-js-imports';
import { detectInvalidScssImport, ScssImportsResult, traverseScssDeps, stratifyScssFiles, SccsImportsError } from '@model/code/handle-scss-imports';
import { getCssModuleCode } from '@model/code/css-module';
import { traverseGlConfig, GoldenLayoutConfig } from '@model/layout/layout.model';
import { CustomPanelMetaKey } from '@model/layout/example-layout.model';
import { awaitWorker } from '@worker/syntax/worker.model';

import { filterActs } from './reducer';
import { Thunk as EditorThunk } from './editor.duck';
import { Thunk as LayoutThunk, Act as LayoutAct } from './layout.duck';

export interface State {
  file: KeyedLookup<Dev.FileState>;
  initialized: boolean;
  /** Mirrors layout.panel */
  panelToMeta: KeyedLookup<Dev.DevPanelMeta>;
  bootstrapped: boolean;
  /** So can persist App instances across site */
  appPortal: KeyedLookup<Dev.AppPortal>;
}

const initialState: State = {
  file: {},
  initialized: false,
  panelToMeta: {},
  bootstrapped: false,
  appPortal: {},
};

export const Act = {
  addAppPortal: (panelKey: string, portalNode: portals.HtmlPortalNode) =>
    createAct('[dev-env] add app portal', { panelKey, portalNode: redact(portalNode) }),
  addFileCleanups: (filename: string, cleanups: (() => void)[]) =>
    createAct('[dev-env] add file cleanups', { filename, cleanups }),
  changePanelMeta: (panelKey: string, input: (
    | { to: 'app' }
    | { to: 'filename'; filename: string }
  )) => createAct('[dev-env] change panel meta', { panelKey, ...input }),
  createCodeFile: (input: { filename: string; contents: string }) =>
    createAct('[dev-env] create code file', input),
  createStyleFile: (input: { filename: string; contents: string }) =>
    createAct('[dev-env] create style file', input),
  createAppPanelMeta: (input: { panelKey: string }) =>
    createAct('[dev-env] create app panel meta', input),
  createFilePanelMeta: (input: { panelKey: string; filename: string }) =>
    createAct('[dev-env] create file panel meta', input),
  deleteFile: (input: { filename: string }) =>
    createAct('[dev-env] remove file', input),
  forgetPanelMeta: (input: { panelKey: string }) =>
    createAct('[dev-env] forget panel meta', input),
  initialized: () =>
    createAct('[dev-env] initialized', {}),
  removeAppPortal: (panelKey: string) =>
    createAct('[dev-env] remove app portal', { panelKey }),
  rememberRenderedApp: (panelKey: string) =>
    createAct('[dev-env] remember rendered app', { panelKey }),
  restrictAppPortals: (input: { panelKeys: string[] }) =>
    createAct('[dev-env] restrict app portals', input),
  setBootstrapped: (isValid: boolean) =>
    createAct('[dev-env] set bootstrapped', { isValid }),
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
   * IN PROGRESS
   */
  analyzeTranspiledJs: createThunk(
    '[dev-env] analyze transpiled js',
    async ({ dispatch, state: { devEnv } }, { filename, nextTranspiledJs }: {
      filename: string;
      nextTranspiledJs: string;
    }): Promise<Dev.AnalyzeNextCode> => {
      /**
       * TODO 
       * - ts/tsx must be relative without extension
       *   > .filter(x => !x.path.startsWith('./') || !(x.path.slice(2) in devEnv.file))
       * - ts only import/export values from ts (can import 'redux')
       * - tsx only import/export values from tsx (can import 'react', 'react-redux')
       * - tsx only import/export React component values (ditto)
       * 
       * We'll detect these during `computeTsImportsExports`.
       */
      await dispatch(Thunk.rememberSrcPathIntervals({ filename }));
      const srcPathErrors = [] as Dev.SourcePathError[]; // TODO
      const jsPathErrors = [] as Dev.JsPathError[]; // TODO

      // Also detect cyclic dependencies
      const { imports, exports, cyclicDepError } = await dispatch(
        Thunk.testCyclicJsDependency({ filename, nextTranspiledJs }));
      cyclicDepError && jsPathErrors.push(cyclicDepError);

      return {
        srcPathErrors,
        jsPathErrors,
        imports,
        exports,
        cyclicDepError,
        prevCyclicError: ((devEnv.file[filename] as Dev.CodeFile).transpiled?.jsPathErrors
          .find((x): x is Dev.CyclicDepError => x.key === 'cyclic-dependency') || null),
      };
    },
  ),
  /**
   * Transform transpiled js via ReactFreshBabelPlugin.
   */
  applyReactRefreshTransform: createThunk(
    '[dev-env] apply react refresh transform',
    ({ state: { editor: { syntaxWorker } } }, { filename, js }: { filename: string; js: string }) => {
      const jsFilename = filename.replace(/\.tsx?$/, '.js');
      syntaxWorker!.postMessage({ key: 'request-react-refresh-transform', filename: jsFilename, code: js });
      return awaitWorker('send-react-refresh-transform', syntaxWorker!, ({ origCode }) => origCode === js);
    },
  ),
  appPortalIsReady: createThunk(
    /**
     * NOOP used to trigger bootstrapAppInstance
     */
    '[dev-env] app portal is ready',
    (_, _input: { panelKey: string }) => void null,
  ),
  bootstrapAppInstance: createThunk(
    '[dev-env] bootstrap app instance',
    ({ state: { devEnv }, dispatch }, { panelKey }: { panelKey: string }) => {
      /**
       * 1st attempt at implementing react-refresh
       * TODO invalidate when exports change
       */
      if (!devEnv.bootstrapped || !devEnv.appPortal[panelKey].rendered) {
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

      // Replace module specifiers with blob urls so can dynamically load
      await dispatch(Thunk.patchAllTranspiledCode({}));

      // Mount the respective es modules as <script>'s of type "module"
      const { devEnv } = getState();
      const jsFiles = Dev.getReachableJsFiles(devEnv.file).reverse();
      for (const { key: filename, esModule: esm } of jsFiles) {
        Dev.ensureEsModule({
          scriptId: Dev.filenameToScriptId(filename),
          scriptSrcUrl: esm!.blobUrl,
        });
      }

      // Get App from dynamic module and store inside static module
      const appUrl = (devEnv.file['index.tsx'] as Dev.CodeFile).esModule!.blobUrl;
      await storeAppFromBlobUrl(appUrl);

      // Render App in each panel
      Object.values(devEnv.panelToMeta).filter(({ panelType }) => panelType === 'app')
        .forEach(({ key: panelKey }) => dispatch(Thunk.bootstrapAppInstance({ panelKey })));
  
      dispatch(Act.setBootstrapped(true));
    },
  ),
  /**
   * Store transpiled scss in a <style>.
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
      next: { to: 'app' } | { to: 'filename'; filename: string };
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
      imports: PatchJs.JsImportMeta[];
      exports: PatchJs.JsExportMeta[];
    }): null | Dev.CyclicDepError => {
      const filenames = Object.keys(devEnv.file);
      const dependencyPaths = PatchJs.importPathsToCodeFilenames(([] as string[]).concat(
        imports.map(({ path }) => path.value),
        exports.filter(PatchJs.isTsExportDecl).map(({ from }) => from.value),
      ), filenames);

      /** Files that `filename` imports/exports */
      const dependencies = dependencyPaths.map(filename => devEnv.file[filename] as Dev.CodeFile);
      /** Files that import/export `filename`, and `filename` itself */
      const dependents = Object.values(devEnv.file).filter(({ key, transpiled }) =>
        key === filename || (transpiled?.type === 'js' && (
          transpiled.importFilenames.includes(filename)
          || transpiled.exportFilenames.includes(filename)
        ))
      ) as Dev.CodeFile[];
      /**
       * Error iff adding this module creates a cycle:
       * some direct dependency of `filename` has
       * some direct dependent of `filename` as a transitive-dependency.
       */
      for (const dependencyFile of dependencies) {
        const error = PatchJs.traverseDeps(dependencyFile, devEnv.file as KeyedLookup<Dev.CodeFile>, lookupFromValues(dependents), filenames.length);
        if (error) {
          return {
            key: 'cyclic-dependency',
            path: dependencyFile.key,
            info: 'Cyclic dependencies are unsupported; types are unrestricted.',
            dependent: error.dependent,
          };
        }
      }
      return null;
    },
  ),
  /**
   * Detect dependency cycles in scss (assuming `prefixed`).
   * Provide stratification if successful.
   */
  detectScssImportError: createThunk(
    '[dev-env] detect scss dependency cycles',
    ({ state: { devEnv } }, { filename }: { filename: string }): ScssImportsResult => {
      const files = pluck(devEnv.file, ({ ext }) => ext === 'scss') as KeyedLookup<Dev.PrefixedStyleFile>;
      const file = files[filename];

      const invalidImport = detectInvalidScssImport(filename, files);
      if (invalidImport) {
        return { key: 'error', errorKey: 'import-unknown', dependency: filename, inFilename: filename, fromFilename: invalidImport.path };
      }

      const dependencyPaths = file.pathIntervals.map(({ path }) => path.slice(2));
      const dependencies = dependencyPaths.map(filename => files[filename]);
      const dependents = Object.values(files).filter(({ key, pathIntervals }) =>
        key === filename || pathIntervals.some(({ path }) => path === filename));

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
   * IN PROGRESS
   */
  handleCodeAnalysis: createThunk(
    '[dev-env] handle code errors',
    async ({ dispatch }, {
      filename,
      analyzed: { prevCyclicError, cyclicDepError },
    }: { filename: string; analyzed: Dev.AnalyzeNextCode }) => {
      const modelKey = filenameToModelKey(filename);
      if (cyclicDepError) {
        dispatch(Thunk.handleCyclicJsDepError({ filename, cyclicDepError }));
      } else {
        dispatch(EditorThunk.setModelMarkers({ modelKey, markers: [] }));
        if (prevCyclicError) {
          dispatch(Thunk.tryTranspileCodeModel({ filename: prevCyclicError.path, onlyIf: 'invalid' }));
        }
      }      
    },
  ),
  handleCyclicJsDepError: createThunk(
    '[dev-env] handle cyclic js dep error',
    ({ dispatch, state: { devEnv } }, { filename, cyclicDepError }: {
      filename: string;
      cyclicDepError: Dev.CyclicDepError;
    }) => {
      console.error(`Cyclic dependency for ${filename}: ${JSON.stringify(cyclicDepError)}`);
      const modelKey = filenameToModelKey(filename);
      // Expect pathIntervals paths to be relative e.g. ./foo-bar
      const pathIntervals = (devEnv.file[filename] as Dev.CodeFile).pathIntervals;
      const badIntervals = pathIntervals.filter(({ path }) => cyclicDepError.path.startsWith(path.slice(2)));
      const markers = badIntervals.map((interval) => PatchJs.getCyclicDepMarker(interval));
      dispatch(EditorThunk.setModelMarkers({ modelKey, markers }));
      // Retranspile cyclic dependency if currently valid
      dispatch(Thunk.tryTranspileCodeModel({ filename: cyclicDepError.path, onlyIf: 'valid' }));
    },
  ),
  handleScssImportError: createThunk(
    '[dev-env] handle scss import error',
    ({ state: { devEnv } }, { filename, importError }: {
      filename: string;
      importError: SccsImportsError;
    }) => {
      console.error(`Scss import error for ${filename}: ${JSON.stringify(importError)}`);
      const pathIntervals = (devEnv.file[filename] as Dev.StyleFile).pathIntervals;
      /**
       * TODO use pathIntervals to construct markers
       */
      if (importError.errorKey === 'import-unknown') {
        // Malformed import either in `filename` or reachable from valid import
        if (importError.dependency === filename) {
          const badIntervals = pathIntervals.filter(({ path }) => path === importError.fromFilename);
          console.log({ scssImportUnknown: badIntervals });
        } else {
          const badIntervals = pathIntervals.filter(({ path }) => path.slice(2) === importError.dependency);
          console.log({ scssTransitiveImportUnknown: badIntervals });
        }
        // dispatch(EditorThunk.setModelMarkers({ modelKey, markers: [] }));
      }
    },
  ),
  initialize: createThunk(
    '[dev-env] initialize',
    ({ dispatch, state: { devEnv } }) => {
      /**
       * TEMP provide demo files.
       */
      !devEnv.file['index.tsx']?.contents &&
        dispatch(Act.createCodeFile({ filename: 'index.tsx', contents: exampleTsx3 }));
      !devEnv.file['model.ts']?.contents &&
        dispatch(Act.createCodeFile({ filename: 'model.ts', contents: exampleTs1 }));
      !devEnv.file['index.scss']?.contents &&
        dispatch(Act.createStyleFile({ filename: 'index.scss', contents: exampleScss1 }));
      !devEnv.file['other.scss']?.contents &&
        dispatch(Act.createStyleFile({ filename: 'other.scss', contents: exampleScss2 }));
      dispatch(Act.initialized());
    },
  ),
  /**
   * To display app need to replace import/export module specifers in transpiled js by
   * valid urls. We use (a) an asset url for react, (b) blob urls for relative paths.
   */
  patchAllTranspiledCode: createThunk(
    '[dev-env] patch all transpiled code',
    async ({ dispatch, state: { devEnv } }) => {
      /**
       * Stratify transpiled javascript files and apply import/export patches.
       * We'll use code-intervals already stored in transpiled.imports.
       */
      const jsFiles = Dev.getReachableJsFiles(devEnv.file) as Dev.TranspiledCodeFile[];
      const stratification = PatchJs.stratifyJsFiles(jsFiles);
      const filenameToPatched = PatchJs.patchTranspiledJsFiles(devEnv.file, stratification);
        
      for (const [filename, { patchedCode, blobUrl }] of Object.entries(filenameToPatched)) {
        dispatch(Act.updateFile(filename, { esModule: { patchedCode, blobUrl } }));
      }
    },
  ),
  /** Remember code-intervals of source import/exports, so can show errors. */
  rememberSrcPathIntervals: createThunk(
    '[dev-env] remember src code imports/exports',
    async ({ dispatch }, { filename }: { filename: string }) => {
      const { imports, exports } = await dispatch(EditorThunk.computeTsImportExports({ filename }));
      const metas = imports.map(({ path }) => path).concat(
        exports.filter(PatchJs.isTsExportDecl).map(({ from }) => from));
      const pathIntervals: Dev.SourcePathInterval[] = metas
        .map(({ value, start, startCol, startLine }) => ({
          path: value,
          start,
          line: startLine,
          startCol,
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
      const disposable = dispatch(EditorThunk.trackModelChange({ do: storeFileContents, delayType: 'debounce', delayMs: 500, modelKey }));
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
      const disposable = dispatch(EditorThunk.trackModelChange({ do: transpileCode, delayType: 'debounce', delayMs: 500, modelKey }));
      dispatch(Act.addFileCleanups(filename, [() => disposable.dispose()]));
    },
  ),
  testCyclicJsDependency: createThunk(
    '[dev-env] test cyclic dependency',
    async ({ dispatch, state: { devEnv } }, { filename, nextTranspiledJs }: { filename: string; nextTranspiledJs?: string }) => {
      const file = devEnv.file[filename] as Dev.CodeFile;
      const jsFilename = filename.replace(/\.tsx?$/, '.js');
      /** Defaults to previously transpiled js */
      const code = nextTranspiledJs || file.transpiled!.dst;
      const { imports, exports } = await dispatch(EditorThunk.computeJsImportExports({ jsFilename, code }));
      const cyclicDepError = dispatch(Thunk.detectCodeDependencyCycles({ filename, imports, exports })) as null | Dev.CyclicDepError;
      return {
        imports,
        exports,
        cyclicDepError,
      };
    },
  ),
  tryPrefixStyleFile: createThunk(
    '[dev-env] try prefix style file',
    async ({ state: { devEnv, editor: e }, dispatch }, { filename }: { filename: string }) => {
      const { contents, prefixed } = devEnv.file[filename] as Dev.StyleFile;
      const syntaxWorker = e.syntaxWorker!;

      if (contents !== prefixed?.src) {
        syntaxWorker.postMessage({ key: 'request-scss-prefixing', filename, scss: contents });
        const result = await awaitWorker('send-prefixed-scss', syntaxWorker, ({ origScss }) => contents === origScss);

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
  /** Try to transpile a ts/tsx file. */
  tryTranspileCodeModel: createThunk(
    '[dev-env] try transpile code model',
    async ({ dispatch, state: { devEnv } }, { filename, onlyIf }: {
      filename: string;
      onlyIf?: 'valid' | 'invalid'; // Used to break cycles
    }) => {
      const currFile = devEnv.file[filename] as Dev.CodeFile;
      const isValid = Dev.isFileValid(currFile);
      if (onlyIf === 'valid' && !isValid || onlyIf === 'invalid' && isValid) return;

      const needsTranspile = currFile.transpiled?.src !== currFile.contents;
      const modelKey = filenameToModelKey(filename);
      const transpiled: TsTranspilationResult = currFile.transpiled && !needsTranspile
        ? { key: 'success', src: currFile.contents, js: currFile.transpiled.dst, typings: currFile.transpiled.typings }
        : await dispatch(EditorThunk.transpileTsMonacoModel({ modelKey }));

      if (transpiled.key !== 'success') {
        // Don't show import errors if transpile failed
        dispatch(EditorThunk.setModelMarkers({ modelKey, markers: [] }));
        dispatch(Thunk.forgetCodeTranspilation({ filename })); // Cleanliness
        return;
      }
      
      // Must apply transform 1st -- we'll patch code-intervals
      // later using `analyzed.imports` and `analyzed.exports`.
      const { transformedCode } = await dispatch(Thunk.applyReactRefreshTransform({ filename, js: transpiled.js }));
      const analyzed = await dispatch(Thunk.analyzeTranspiledJs({ filename, nextTranspiledJs: transformedCode }));

      dispatch(Thunk.updateCodeTranspilation({
        filename,
        src: transpiled.src,
        // transpiled & transformed, yet imports/exports unpatched
        dst: transformedCode,
        imports: analyzed.imports,
        exports: analyzed.exports,
        typings: transpiled.typings,
        jsPathErrors: analyzed.jsPathErrors,
      }));

      dispatch(Thunk.handleCodeAnalysis({ filename, analyzed }));
    },
  ),
  /** Try to transpile scss. */
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
      imports: PatchJs.JsImportMeta[];
      exports: PatchJs.JsExportMeta[];
      jsPathErrors: Dev.JsPathError[];
    }) => {
      devEnv.file[filename]?.transpiled?.cleanups.forEach(cleanup => cleanup());
      const typesFilename = filename.replace(/\.tsx?$/, '.d.ts');
      const disposable = dispatch(EditorThunk.addTypings({ filename: typesFilename, typings: rest.typings }));
      const allFilenames = Object.keys(devEnv.file);
      dispatch(Act.storeCodeTranspilation(filename, {
        type: 'js',
        ...rest,
        cleanups: [() => disposable.dispose()],
        importFilenames: PatchJs.importPathsToCodeFilenames(rest.imports.map(({ path }) => path.value), allFilenames),
        exportFilenames: PatchJs.importPathsToCodeFilenames(rest.exports
          .filter(PatchJs.isTsExportDecl).map(({ from }) => from.value), allFilenames),
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
    case '[dev-env] change panel meta': {
      const metaState = Dev.getDevPanelMetaState(state.panelToMeta[act.pay.panelKey]);
      return { ...state,
        panelToMeta: addToLookup(act.pay.to === 'app'
          ? { ...Dev.createDevPanelAppMeta(act.pay.panelKey), ...metaState }
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
        pathErrors: [],
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
        pathErrors: [],
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
    case '[dev-env] remember rendered app': return { ...state,
      appPortal: updateLookup(act.pay.panelKey, state.appPortal, () => ({
        rendered: true,
      })),
    };
    case '[dev-env] remove file': return { ...state,
      file: removeFromLookup(act.pay.filename, state.file),
    };
    case '[dev-env] remove app portal': return { ...state,
      appPortal: removeFromLookup(act.pay.panelKey, state.appPortal),
    };
    case '[dev-env] restrict app portals': return { ...state,
      appPortal: pluck(state.appPortal, ({ key }) => act.pay.panelKeys.includes(key)),
    };
    case '[dev-env] set bootstrapped': return { ...state,
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
    case '[dev-env] update panel meta': return { ...state,
      panelToMeta: updateLookup(act.pay.panelKey, state.panelToMeta, act.pay.updates),
    };    
    default: return state || testNever(act);
  }
};

const bootstrapAppInstances = createEpic(
  (action$, state$) => action$.pipe(
    filterActs(
      '[dev-env] store code transpilation',
      '[dev-env] app portal is ready',
      '[dev-env] change panel meta',
    ),
    flatMap((act) => {
      const { file, bootstrapped } = state$.value.devEnv;

      if (act.type === '[dev-env] store code transpilation') {
        const reachableJsFiles = Dev.getReachableJsFiles(file);
        if (!reachableJsFiles.includes(file[act.pay.filename] as Dev.CodeFile)) {
          return []; // Ignore files unreachable from index.tsx
        }
        if (reachableJsFiles.every((f) => Dev.isFileValid(f))) {
          return [// All reachable code locally valid so try bootstrap app
            Thunk.bootstrapApps({}),
          ];
        } else if (bootstrapped) {
          return [Act.setBootstrapped(false)];
        }
      } else if (act.type === '[dev-env] app portal is ready') {
        if (bootstrapped) {
          return [Thunk.bootstrapAppInstance({ panelKey: act.args.panelKey })];
        }
      } else if (act.type === '[dev-env] change panel meta') {
        if (act.pay.to === 'filename') {
          return [Thunk.tryUnmountAppInstance({ panelKey: act.pay.panelKey })];
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
        key !== filename && pathIntervals.some(({ path }) => path === `./${filename}`));
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
        return [LayoutThunk.setPanelTitle({ panelKey,
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
  bootstrapAppInstances,
  bootstrapStyles,
  initializeFileSystem,
  initializeMonacoModels,
  manageAppPortals,
  onChangePanel,
  resizeMonacoWithPanel,
  trackCodeFileContents,
);
