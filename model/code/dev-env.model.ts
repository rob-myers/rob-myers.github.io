import { HtmlPortalNode } from 'react-reverse-portal';
import { KeyedLookup, lookupFromValues } from '@model/generic.model';
import { LayoutPanelMeta } from '@model/layout/layout.model';
import { CustomPanelMetaKey } from '@model/layout/example-layout.model';
import { TsExportMeta, TsImportMeta } from './patch-js-imports';
import { Redacted } from '@model/store/redux.model';

export const menuHeightPx = 32;

const supportedFileMetas = ['.tsx', '.scss', '.ts'];

export function hasSupportedExtension(filename: string) {
  return supportedFileMetas.some((filenameExt) => filename.endsWith(filenameExt));
}

type Meta = LayoutPanelMeta<CustomPanelMetaKey>

export function isFilePanel(panelMeta: Meta): panelMeta is Meta & { filename: string } {
  return supportedFileMetas.some((filenameExt) =>
    panelMeta?.filename?.endsWith(filenameExt));
}

export function isAppPanel(panelMeta: Meta) {
  return panelMeta?.devEnvComponent === 'App';
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
  document.getElementById(input.scriptId)?.remove();
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
  cssModule: null | {
    code: string;
    blobUrl: string;
  };
  /**
   * Contains original scss and prefixed scss
   * i.e. each class is prefixed using filename.
   */
  prefixed: null | {
    src: string;
    dst: string;
  };
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
  /** Code intervals of paths specifiers in import/export/@import's */
  pathIntervals: ModuleSpecifierInterval[];
  /**
   * Module specifier errors for untranspiled ts/tsx/scss.
   * We store js-specific errors in `CodeTranspilation`.
   */
  pathErrors: SourcePathError[];
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

/** Untranspiled module specifier errors */
export type SourcePathError = { label: string; interval: CodeInterval } & (
  | { key: 'require-import-relative'; info: 'local imports must be relative' }
  | { key: 'require-export-relative'; info: 'exports must be relative' }
  | { key: 'require-scss-exists'; info: 'scss file not found' }
  | { key: 'only-export-cmp'; info: 'tsx export values must be react components' }
);
  
/**
 * Transpiled js error.
 * Errors will be shown in source by matching `path`.
 */
export type JsPathError = (
  | { key: 'cyclic-dependency'; path: string; info: 'Cyclic dependencies are unsupported; types are unrestricted.'; dependent: string }
  | { key: 'only-import-ts'; path: string; info: 'ts files can only import values from other ts files' }
  | { key: 'only-export-ts'; path: string; info: 'ts files can only export values from other ts files' }
  | { key: 'only-import-tsx'; path: string; info: 'tsx files can only import values from other tsx files' }
  | { key: 'only-export-tsx'; path: string; info: 'tsx files can only export values from other tsx files' }
);
export type CyclicDepError = Extract<JsPathError, { key: 'cyclic-dependency' }>;

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
  return !file.pathErrors.length && (
    file.ext === 'scss' || (
      file.transpiled?.type === 'js'
      && !file.transpiled.jsPathErrors.length
      && file.transpiled.src === file.contents
    ));
}

/** Get ts/tsx files reachable from index.tsx */
export function getReachableJsFiles(file: KeyedLookup<FileState>) {
  const frontier = [file['index.tsx']] as CodeFile[];
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
  const frontier = [file[rootFilename]] as PrefixedStyleFile[];
  const reachable = lookupFromValues(frontier);
  while (frontier.length) {
    const prevFrontier = frontier.slice();
    frontier.length = 0;
    prevFrontier.forEach((node) => {
      const newAdjs = (node.pathIntervals || [])
        .filter(({ value }) => !(value.slice(2) in reachable))
        .map(({ value }) => file[value.slice(2)] as PrefixedStyleFile);
      frontier.push(...newAdjs);
      newAdjs.forEach(f => reachable[f.key] = f);
    });
  }
  return Object.values(reachable);
}

export type DevPanelMeta = DevPanelFileMeta | DevPanelAppMeta;

interface DevPanelFileMeta extends BasePanelMeta {
  panelType: 'file';
  filename: string;
}
export interface DevPanelAppMeta extends BasePanelMeta {
  panelType: 'app';
  elementId: string;
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
  srcPathErrors: SourcePathError[];
  jsPathErrors: JsPathError[];
  imports: TsImportMeta[];
  exports: TsExportMeta[];
  cyclicDepError: CyclicDepError | null;
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
