import { CyclicDepError, UntranspiledImportPath, JsExportMeta, JsImportMeta } from './patch-imports.model';
import { KeyedLookup, lookupFromValues } from '@model/generic.model';

const supportedFileMetas = [
  { filenameExt: '.tsx', panelKeyPrefix: 'tsx' },
  { filenameExt: '.scss', panelKeyPrefix: 'scss'},
  { filenameExt: '.ts', panelKeyPrefix: 'ts'},
];

export function hasSupportedExtension(filename: string) {
  return supportedFileMetas.some(({ filenameExt }) => filename.endsWith(filenameExt));
}

export function isFilePanel(panelKey: string, filename?: string) {
  return supportedFileMetas.some(({ filenameExt, panelKeyPrefix }) =>
    panelKey.startsWith(panelKeyPrefix) && filename?.endsWith(filenameExt));
}

export function isAppPanel(panelKey: string) {
  return /^app(-|$)/.test(panelKey);
}

export function panelKeyToAppElId(panelKey: string) {
  return `app-render-root-${panelKey}`;
}

export function panelKeyToEditorKey(panelKey: string) {
  return `editor-${panelKey}`;
}

export function filenameToModelKey(filename: string) {
  return `model-${filename}`;
}

export interface FileState {
  /** Filename */
  key: string;
  /** Debounced value (doesn't drive editor) */
  contents: string;
  /** Filename extension (suffix of `key`) */
  ext: 'tsx' | 'ts' | 'scss';
  /** Code intervals in untranspiled code used to indicate errors */
  importIntervals: UntranspiledImportPath[];
  /** Last transpilation */
  transpiled: null | Transpilation;
  /** Can dispose model code/transpile trackers */
  cleanupTrackers: (() => void)[];
  /**
   * Actual code inside <script> or <style>.
   * For js this is `transpiled.dst` with import specifiers replaced by blob urls.
   */
  patchedCode: null | string;
}

export type TranspiledJsFile = FileState & { transpiled: TranspiledJs };
export type JsFileState = FileState & { ext: 'ts' | 'tsx'; transpiled: null | TranspiledJs }

export type Transpilation = {
  src: string;
  /** Transpiled code */
  dst: string;
  /** e.g. remove previous typings (js only) */
  cleanups: (() => void)[];
} & (
  | {
    type: 'js';
    exports: JsExportMeta[];
    imports: JsImportMeta[];
    importFilenames: string[];
    /** Is there a cyclic dependency in transpiled code? */
    cyclicDepError: null | CyclicDepError;
  }
  | { type: 'css' }
)

export type TranspiledJs = Extract<Transpilation, { type: 'js' }>;

export function isFileValid(file: FileState) {
  return file.ext === 'scss' || (
    file.transpiled?.type === 'js'
    && !file.transpiled.cyclicDepError
    && file.transpiled.src === file.contents
  );
}

/** Get ts/tsx files reachable from index.tsx */
export function getReachableJsFiles(file: KeyedLookup<FileState>) {
  const frontier = [file['index.tsx']] as JsFileState[];
  const reachable = lookupFromValues(frontier);
  while (frontier.length) {
    const prevFrontier = frontier.slice();
    frontier.length = 0;
    prevFrontier.forEach((node) => {
      const newAdjs = (node.transpiled?.importFilenames || [])
        .filter(filename => !(filename in reachable))
        .map(filename => file[filename] as JsFileState);
      frontier.push(...newAdjs);
      newAdjs.forEach(f => reachable[f.key] = f);
    });
  }
  return Object.values(reachable);
}
