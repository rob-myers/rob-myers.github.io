import { KeyedLookup } from '@model/generic.model';

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

export interface JsImportMeta {
  type: 'import-decl';
  /** e.g. `react` or `./index` */
  path: string;
  /** First character of path excluding quotes */
  pathStart: number;
  names: { name: string; alias?: string }[];
  namespace?: string;
}

/** All exports inside file `key`. */
export interface JsExportMeta {
  type: 'export-symb' | 'export-decl' | 'export-asgn';
  names: { name: string; alias?: string }[];
  namespace?: string;
  /** Can export from another module */
  from?: string;
}

/** Returns filenames without dups */
export function importPathsToFilenames(importPaths: string[], filenames: string[]) {
  return importPaths
    .filter((x, i) => x.startsWith('./') && i === importPaths.indexOf(x))
    .map(x => x.slice(2)) // TODO handle prefixes of others
    .map(x => filenames.find(y => y.startsWith(x))!);
}

export interface FileState {
  /** Filename */
  key: string;
  /** Debounced value (doesn't drive editor) */
  contents: string;
  ext: 'tsx' | 'ts' | 'scss';
  /** Last transpilation */
  transpiled: null | Transpilation;
}

export type Transpilation = {
  src: string;
  dst: string;
  /** e.g. remove previous typings (js only) */
  cleanups: (() => void)[];
} & (
  | {
    type: 'js';
    exports: JsExportMeta[];
    imports: JsImportMeta[];
    importPaths: string[];
  }
  | { type: 'css' }
)

export type TranspiledJs = Extract<Transpilation, { type: 'js' }>;

/**
 * Is some `dependent` a transitive-dependency of `f`?
 */
export function traverseDeps(
  f: FileState,
  file: KeyedLookup<FileState>,
  dependents: KeyedLookup<FileState>,
  maxDepth: number
): null | { key: 'dep-cycle'; filename: string } {
  if (maxDepth <= 0) return null;
  // Ignore untranspiled (?)
  if (!f.transpiled) return null;

  const { importPaths } = f.transpiled as TranspiledJs;
  if (dependents[f.key]) return { key: 'dep-cycle', filename: f.key };

  for (const depPath of importPaths) {
    const error = traverseDeps(file[depPath], file, dependents, maxDepth - 1);
    if (error) return error;
  }
  return null;
}
