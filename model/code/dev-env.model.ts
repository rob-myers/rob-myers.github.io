import { KeyedLookup } from '@model/generic.model';
import { IMarkerData } from '@model/monaco/monaco.model';

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

export interface JsImportMeta {
  type: 'import-decl';
  path: {
    /** e.g. `react` or `./index` */
    value: string;
    /** First character of path excluding quotes */
    start: number;
    startLine: number;
    startCol: number;
  };
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
export function importPathsToFilenames(
  importPaths: string[],
  allFilenames: string[],
) {
  return importPaths
    .filter((x, i) => x.startsWith('./') && i === importPaths.indexOf(x))
    .map(x => x.slice(2))
    // TODO handle case where one filename is a prefix of another
    .map(x => allFilenames.find(y => y.startsWith(x))!);
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
}

export type TranspiledJsFile = FileState & { transpiled: TranspiledJs };

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

export interface UntranspiledImportPath {
  /** e.g. `react` or `./index` */
  path: string;
  /** First character of path in untranspiled code */
  start: number;
  startLine: number;
  startCol: number;
}

/**
 * Is some `dependent` a transitive-dependency of `f`?
 * If so we return the first one found.
 */
export function traverseDeps(
  f: FileState,
  file: KeyedLookup<FileState>,
  dependents: KeyedLookup<FileState>,
  maxDepth: number
): null | TraverseDepsError {
  if (maxDepth <= 0 || !f.transpiled) return null;

  const { importFilenames } = f.transpiled as TranspiledJs;
  if (dependents[f.key]) {
    return { key: 'dep-cycle', dependent: f.key };
  }

  for (const importFilename of importFilenames) {
    const error = traverseDeps(file[importFilename], file, dependents, maxDepth - 1);
    if (error) return error;
  }
  return null;
}

type TraverseDepsError = { key: 'dep-cycle'; dependent: string };
export type CyclicDepError = TraverseDepsError & { dependency: string };

export function getCyclicDepMarker(
  { path, startLine, startCol }: UntranspiledImportPath,
): IMarkerData {
  return {
    message: [
      'Cyclic dependencies are unsupported.',
      'However, there is no restriction on typings.'
    ].join(' '),
    startLineNumber: startLine,
    startColumn: startCol,
    endLineNumber: startLine,
    endColumn: startCol + path.length + 2,
    severity: 8,
  };
}

export function isFileValid(file: FileState) {
  return file.ext === 'scss' || (
    file.transpiled?.type === 'js'
    && !file.transpiled.cyclicDepError
    && file.transpiled.src === file.contents
  );
}

/**
 * Stratify files by dependencies.
 * We've ensured they are non-cyclic and valid.
 */
export function stratifyJsFiles(jsFiles: TranspiledJsFile[]) {
  const stratification = [] as string[][];
  const permittedDeps = { react: true } as Record<string, true>;

  const lookup = jsFiles.reduce((agg, { key, transpiled: { importFilenames } }) => ({
    ...agg, [key]: { filename: key, dependencies: importFilenames }
  }), {} as Record<string, { filename: string; dependencies: string[] }>);
  
  let values = Object.values(lookup);

  while (values.length) {
    const level = values
      .filter(({ dependencies, filename }) =>
        dependencies.every(dep => dep === filename || dep in permittedDeps))
      .map(({ filename }) => filename);
    stratification.push(level);

    level.forEach((filename) => {
      delete lookup[filename];
      permittedDeps[filename] = true;
    });
    values = Object.values(lookup);
  }

  console.log({ stratification });
  return stratification;
}
