import { KeyedLookup, lookupFromValues } from '@model/generic.model';
import { LayoutPanelMeta } from '@model/layout/layout.model';
import { CustomPanelMetaKey } from '@model/layout/example-layout.model';
import { CyclicDepError, JsExportMeta, JsImportMeta } from './patch-js-imports';

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

export interface TranspiledCodeFile extends CodeFile {
  transpiled: CodeTranspilation;
}

export interface TranspiledStyleFile extends StyleFile {
  transpiled: StyleTranspilation;
}

export interface CodeFile extends BaseFile {
  /** Filename extension (suffix of `key`) */
  ext: 'tsx' | 'ts';
  /** Last transpilation */
  transpiled: null | CodeTranspilation;
  /** es module */
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
  /**
   * Last transpiled css.
   */
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
  pathIntervals: SourcePathInterval[];
  pathErrors: SourcePathError[];
}

export interface PrefixedStyleFile extends StyleFile {
  prefixed: Exclude<StyleFile['prefixed'], null>;
}

export type Transpilation = (
  | CodeTranspilation
  | StyleTranspilation
);

export interface CodeTranspilation extends BaseTranspilation {
  type: 'js';
  exports: JsExportMeta[];
  imports: JsImportMeta[];
  /**
   * First discovered cyclic dependency in transpiled code.
   */
  cyclicDepError: null | CyclicDepError;
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

export interface SourcePathInterval {
  /** e.g. `react` or `./index` or `./index.scss`  */
  path: string;
  /** First character of path in untranspiled code */
  start: number;
  line: number;
  startCol: number;
}

export type SourcePathError = (
  | {key: 'scss-must-be-relative'; path: string;
    info: 'We require @imports to be relative'; }
  | { key: 'ts-must-be-relative'; path: string; 
    info: 'We require ts/tsx imports/exports to be relative'; }
  | { key: 'file-does-not-exist'; path: string;
    info: 'Specified file not found'; }
  | { key: 'ext-must-be-scss'; path: string;
    info: 'An scss file can only @import other scss files'; }
  | { key: 'no-ts-ext-allowed'; path: string;
    info: 'We require ts/tsx imports/exports to omit the extension'; }
  /**
   * TODO ts can only import/export other ts (special constraint) 
   * TODO tsx can only import/export other tsx (special constraint) 
   * TODO tsx only only export react components (special constraint)
   */
);

export function isFileValid(file: FileState) {
  return file.ext === 'scss' || (
    file.transpiled?.type === 'js'
    && !file.transpiled.cyclicDepError
    && file.transpiled.src === file.contents
  );
}

/** Get ts/tsx files reachable from index.tsx */
export function getReachableJsFiles(file: KeyedLookup<FileState>) {
  const frontier = [file['index.tsx']] as CodeFile[];
  const reachable = lookupFromValues(frontier);
  while (frontier.length) {
    const prevFrontier = frontier.slice();
    frontier.length = 0;
    prevFrontier.forEach((node) => {
      const newAdjs = (node.transpiled?.importFilenames || [])
        .filter(filename => !(filename in reachable))
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
        .filter(({ path }) => !(path.slice(2) in reachable))
        .map(({ path }) => file[path.slice(2)] as PrefixedStyleFile);
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
  panelMounted: boolean;
  appRendered: boolean;
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
    panelMounted: false,
    appRendered: false,
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
