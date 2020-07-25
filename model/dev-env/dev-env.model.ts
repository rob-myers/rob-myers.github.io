import { HtmlPortalNode } from 'react-reverse-portal';
import { KeyedLookup, lookupFromValues, testNever } from '@model/generic.model';
import { LayoutPanelMeta } from '@model/layout/layout.model';
import { CustomPanelMetaKey } from '@model/layout/example-layout.model';
import { Redacted } from '@model/store/redux.model';
import { IMarkerData } from '@model/monaco/monaco.model';

export const menuHeightPx = 28;

const supportedFileExts = ['.tsx', '.scss', '.ts'];

export const rootAppFilename = 'app.tsx';

export const rootReducerFilename = 'reducer.ts';

export function hasSupportedExtension(filename: string) {
  return supportedFileExts.some((filenameExt) => filename.endsWith(filenameExt));
}

type Meta = LayoutPanelMeta<CustomPanelMetaKey>

export function isFilePanel(panelMeta: Meta): panelMeta is Meta & { filename: string } {
  return !panelMeta?.devEnvComponent && supportedFileExts
    .some((filenameExt) => panelMeta?.filename?.endsWith(filenameExt));
}

export function isAppPanel(panelMeta: Meta) {
  return panelMeta?.devEnvComponent === 'App';
}

export function isDocPanel(panelMeta: Meta): panelMeta is Meta & { filename: string } {
  return panelMeta?.devEnvComponent === 'Doc';
}

export function panelKeyToAppElId(panelKey: string) {
  return `app-instance-${panelKey}`;
}

export function panelKeyToEditorKey(panelKey: string) {
  return `editor-${panelKey}`;
}

export function filenameToScriptId(filename: string) {
  return `module-for-${filename}`;
}

export function filenameToClassPrefix(filename: string) {
  return `${filename.replace(/\.scss$/, '').replace(/\./g, '_')}__`;
}

export function filenameToStyleId(filename: string) {
  return `styles-for-${filename}`;
}

export function getBlobUrl(jsCode: string) {
  const bootstrapBlob = new Blob([jsCode], { type: 'text/javascript' });
  return URL.createObjectURL(bootstrapBlob);     
}

export function ensureEsModule(input: { scriptId: string; scriptSrcUrl: string }) {
  const previous = document.getElementById(input.scriptId) as HTMLScriptElement | null;
  if (previous) {
    previous.remove();
    URL.revokeObjectURL(previous.src);
  }
  const el = document.createElement('script');
  el.id = input.scriptId;
  el.setAttribute('type', 'module');
  el.src = input.scriptSrcUrl;
  document.head.appendChild(el);
}

export function ensureStyleTag(input: { styleId: string; styles: string }) {
  document.getElementById(input.styleId)?.remove();
  const el = document.createElement('style');
  el.id = input.styleId;
  el.textContent = input.styles;
  document.head.appendChild(el);
}

export function isRelativePath(path: string) {
  return path.startsWith('./') || path.startsWith('../');
}

export function isRuntimeNpmModule(moduleSpecifier: string) {
  return moduleSpecifier === 'react' || moduleSpecifier === 'redux' || moduleSpecifier === 'react-redux';
}

export const projectAliasRegex = /^(?:@package|@reducer)/;

export function resolvePath(absPath: string, moduleSpecifier: string) {
  const resolvedAlias = projectAliasRegex.test(moduleSpecifier)
    ? moduleSpecifier.slice(1) // e.g. @package/foo -> package/foo
    : moduleSpecifier;
  return resolvedAlias === moduleSpecifier
    ? resolveRelativePath(absPath, moduleSpecifier)
    : resolvedAlias; // monaco will resolve from root
}

const resolveCache = {} as Record<string, string>;

export function resolveRelativePath(absPath: string, relPath: string) {
  const key = `${absPath} ${relPath}`;
  if (resolveCache[key]) {
    return resolveCache[key];
  }
  const parts = absPath.split('/');
  parts.pop();
  for (const x of relPath.split('/')) {
    if (x === '.') {
      continue;
    } else if (x === '..' && parts.length) {
      parts.pop();
    } else {
      parts.push(x);
    }
  }
  return resolveCache[key] = parts.join('/');
}

export function withoutFileExtension(filename: string) {
  return filename.split('.').slice(0, -1).join('.');
}

export type FileState = (
  | CodeFile
  | StyleFile
);

export interface CodeFile extends BaseFile {
  /** Filename extension (suffix of `key`) */
  ext: 'tsx' | 'ts';
  /** Last transpilation */
  transpiled: null | CodeTranspilation;
  esModule: null | CodeFileEsModule;
}

export interface StyleFile extends BaseFile {
  ext: 'scss';
  /**
   * Completely determined by filename.
   * This is attached immediately after creation.
   */
  cssModule: null | { code: string; blobUrl: string };
  /**
   * Contains original scss and prefixed scss
   * i.e. each class is prefixed using filename.
   */
  prefixed: null | { src: string; dst: string };
  /** Last transpiled css. */
  transpiled: null | StyleTranspilation;
}

interface BaseFile {
  /** Filename */
  key: string;
  /** Debounced value (doesn't drive editor) */
  contents: string;
  /** Can dispose model code/transpile trackers */
  cleanups: (() => void)[];
  /** Code intervals of module specifiers in import/export/@import's */
  pathIntervals: ModuleSpecifierInterval[];
  /**
   * Module specifier errors for untranspiled ts/tsx/scss.
   * We store js-specific errors in `CodeTranspilation`.
   */
  srcErrors: SourceFileError[];
}

export interface CodeTranspilation extends BaseTranspilation {
  type: 'js';
  exports: TsExportMeta[];
  imports: TsImportMeta[];
  jsPathErrors: JsPathError[];
  typings: string;
  importFilenames: string[];
  exportFilenames: string[];
}

export interface StyleTranspilation extends BaseTranspilation {
  type: 'css';
}

interface BaseTranspilation {
  /** Untranspiled code */
  src: string;
  /** Transpiled code */
  dst: string;
  /** e.g. remove previous typings (js only) */
  cleanups: (() => void)[];
}

export interface CodeFileEsModule {
  blobUrl: string;
  /**
   * Obtained from `transpiled.dst` by replacing import/export
   * specifiers e.g. relative paths become blob urls.
   */
  patchedCode: string;
}

/**
 * Source file errors.
 * Mostly about module specifiers, except `only-export-cmp`.
 */
export interface SourceFileError {
  key: SourceFileErrorKey;
  label: string;
  interval: CodeInterval;
}

type SourceFileErrorKey = (
  | 'require-import-relative'
  | 'require-export-relative'
  | 'require-scss-exists'
  | 'require-file-exists'
  | 'only-export-cmp'
);

export const getSourceFileErrorInfo = (key: SourceFileErrorKey): string => {
  switch (key) {
    case 'only-export-cmp': return 'We require every value exported by a tsx file to have type React.FC<Props>.';
    case 'require-export-relative': return 'Exports must be relative.';
    case 'require-import-relative': return 'Local imports must be relative.';
    case 'require-file-exists': return 'Path not found.';
    case 'require-scss-exists': return 'Scss file not found.';
    default: throw testNever(key);
  }
};

/**
 * Transpiled js error.
 * Errors will be shown in source by matching `path`.
 */
export type JsPathError = (
  | BaseJsPathError<Exclude<JsPathErrorKey, 'cyclic-dependency'>> 
  | (BaseJsPathError<'cyclic-dependency'> & { dependent: string })
);

interface BaseJsPathError<T extends JsPathErrorKey> {
  key: T;
  path: string;
  /** Resolved filename without extension */
  resolved: string;
}
type JsPathErrorKey = (
  | 'cyclic-dependency'
  | 'only-import-ts'
  | 'only-export-ts'
  | 'only-import-tsx'
  | 'only-export-tsx'
);

export const getJsPathErrorInfo = (key: JsPathErrorKey): string => {
  switch (key) {
    case 'cyclic-dependency': return 'Cyclic dependencies are unsupported; types are unrestricted.';
    case 'only-export-ts': return 'We only permit ts files to export values from other ts files.';
    case 'only-export-tsx': return 'We only permit tsx files to export values from other tsx files.';
    case 'only-import-ts': return 'We only permit ts files to import values from other ts files.';
    case 'only-import-tsx': return 'We only permit tsx files to import values from other tsx files.';
    default: throw testNever(key);
  }
};

export type CyclicDepError = Extract<JsPathError, { key: 'cyclic-dependency' }>;

export function isCyclicDepError(x: JsPathError): x is CyclicDepError {
  return x.key === 'cyclic-dependency';
}

export interface TranspiledCodeFile extends CodeFile {
  transpiled: CodeTranspilation;
}

export interface TranspiledStyleFile extends StyleFile {
  transpiled: StyleTranspilation;
}

export interface PrefixedStyleFile extends StyleFile {
  prefixed: Exclude<StyleFile['prefixed'], null>;
}

export function isFileValid(file: FileState) {
  return !file.srcErrors.length && (
    file.ext === 'scss' || (
      file.transpiled?.type === 'js'
      && !file.transpiled.jsPathErrors.length
      && file.transpiled.src === file.contents
    ));
}

/** Get ts/tsx files reachable from app.tsx */
export function getReachableJsFiles(rootFilename: string, file: KeyedLookup<FileState>) {
  const frontier = [file[rootFilename]] as CodeFile[];
  const reachable = lookupFromValues(frontier);
  while (frontier.length) {
    const prevFrontier = frontier.slice();
    frontier.length = 0;
    prevFrontier.forEach((node) => {
      const newAdjs = (
        node.transpiled?.importFilenames.concat(node.transpiled.exportFilenames) || []
      ).filter(filename => !(filename in reachable))
        .map(filename => file[filename] as CodeFile);
      frontier.push(...newAdjs);
      newAdjs.forEach(f => reachable[f.key] = f);
    });
  }
  return Object.values(reachable);
}

export function getReachableScssFiles(rootFilename: string, file: KeyedLookup<PrefixedStyleFile>) {
  const frontier = [file[rootFilename]];
  const reachable = lookupFromValues(frontier);
  while (frontier.length) {
    const prevFrontier = frontier.slice();
    frontier.length = 0;
    prevFrontier.forEach((node) => {
      const newAdjs = (node.pathIntervals || [])
        .filter(({ value }) => !(resolveRelativePath(node.key, value) in reachable))
        .map(({ value }) => file[resolveRelativePath(node.key, value)] as PrefixedStyleFile);
      frontier.push(...newAdjs);
      newAdjs.forEach(f => reachable[f.key] = f);
    });
  }
  return Object.values(reachable);
}

export type DevPanelMeta = (
  | DevPanelFileMeta
  | DevPanelAppMeta
  | DevPanelDocMeta
);

/** A file in the project */
interface DevPanelFileMeta extends BasePanelMeta {
  panelType: 'file';
  filename: string;
}
/** An instance of the App defined by project */
export interface DevPanelAppMeta extends BasePanelMeta {
  panelType: 'app';
  elementId: string;
}
/** A blog entry (external doc) or README (project doc) */
export interface DevPanelDocMeta extends BasePanelMeta {
  panelType: 'doc';
  /** e.g. docs/foo */
  filename: string;
}

interface BasePanelMeta {
  /** Panel key */
  key: string;
  menuOpen: boolean;
}

/**
 * State shared by panels of different types.
 */
export function getDevPanelMetaState({ menuOpen }: DevPanelMeta) {
  return { menuOpen };
}

export function createDevPanelAppMeta(panelKey: string): DevPanelAppMeta {
  return {
    key: panelKey,
    panelType: 'app',
    elementId: panelKeyToAppElId(panelKey),
    menuOpen: false,
  };
}

export function createDevPanelFileMeta(panelKey: string, filename: string): DevPanelFileMeta {
  return {
    key: panelKey,
    panelType: 'file',
    filename: filename,
    menuOpen: false,
  };
}

export function createDevPanelDocMeta(panelKey: string, filename: string): DevPanelDocMeta {
  return {
    key: panelKey,
    panelType: 'doc',
    filename: filename,
    menuOpen: false,
  };
}

/**
 * Persists across different pages, unlike DevPanelAppMeta.
 */
export interface AppPortal {
  /** Panel key */
  key: string;
  portalNode: Redacted<HtmlPortalNode>;
  rendered: boolean;
}

export interface AnalyzeNextCode {
  transformedJs: string;
  jsPathErrors: JsPathError[];
  jsImports: TsImportMeta[];
  jsExports: TsExportMeta[];
  // cyclicDepError: CyclicDepError | null;
  prevCyclicError: CyclicDepError | null;
}

export interface ModuleSpecifierInterval {
  /** e.g. `react` or `./index` */
  value: string;
  interval: CodeInterval;
}

export interface CodeInterval {
  start: number;
  end: number;
  startLine: number;
  startCol: number;
  endLine: number;
  endCol: number;
}

export function getSrcErrorMarker({ key, interval }: SourceFileError): IMarkerData {
  return {
    message: getSourceFileErrorInfo(key),
    startLineNumber: interval.startLine,
    startColumn: interval.startCol,
    endLineNumber: interval.startLine,
    endColumn: interval.endCol,
    severity: 8,
  };
}

export function getJsPathErrorMarkers(
  filename: string,
  jsErrors: JsPathError[],
  metas: ModuleSpecifierInterval[],
): IMarkerData[] {
  const metaErrors = metas.map((meta) => ({ meta, jsErrors: jsErrors.filter(x =>
    x.resolved === resolveRelativePath(filename, meta.value)),
  }));
  return metaErrors.flatMap(({ meta: { interval }, jsErrors }) =>
    jsErrors.map(({ key }) => ({
      message: getJsPathErrorInfo(key),
      startLineNumber: interval.startLine,
      startColumn: interval.startCol,
      endLineNumber: interval.startLine,
      endColumn: interval.endCol,
      severity: 8,
    })));
}

export type TsImportMeta = {
  key: 'import-decl';
  from: ModuleSpecifierInterval;
} & (
  | { names: { name: string; alias: string | null }[] }
  | { namespace: string }
  | { defaultAlias: string }
)

export type TsExportMeta = (
  | TsExportSymb
  | TsExportDecl
  | TsExportAsgn
);

interface TsExportSymb {
  key: 'export-symb';
  name: string;
  type: string | null;
  interval: CodeInterval;
}
type TsExportDecl = {
  key: 'export-decl';
  /** Can export from another module */
  from: ModuleSpecifierInterval;
} & (
  | { names: { name: string; alias: string | null }[] }
  | { namespace: string }
)
interface TsExportAsgn {
  key: 'export-asgn';
  name: 'default';
  type: string | null;
  interval: CodeInterval;
}

export function isTsExportDecl(x: TsExportMeta): x is TsExportDecl {
  return x.key === 'export-decl';
}

export interface LoadedPackage {
  key: string;
  file: KeyedLookup<LoadedPackageFile>;
}

interface LoadedPackageFile {
  /** Filename e.g.  */
  key: string;
  contents: string;
}
