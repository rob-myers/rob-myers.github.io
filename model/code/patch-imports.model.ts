import { KeyedLookup } from '@model/generic.model';
import { IMarkerData } from '@model/monaco/monaco.model';
import { FileState, TranspiledJs, TranspiledJsFile } from './dev-env.model';

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

export interface JsExportMeta {
  type: 'export-symb' | 'export-decl' | 'export-asgn';
  names: { name: string; alias?: string }[];
  namespace?: string;
  /** Can export from another module */
  from?: string;
}

/** Returns filenames without dups, ignoring 'react' */
export function importPathsToFilenames(importPaths: string[], allFilenames: string[]) {
  return importPaths
    .filter((x, i) => x.startsWith('./') && i === importPaths.indexOf(x))
    .map(x => relPathToFilename(x, allFilenames));
}

export function relPathToFilename(relPath: string, allFilenames: string[]) {
  const filenamePrefix = relPath.slice(2);
  // TODO handle case where one filename is a prefix of another
  return allFilenames.find(y => y.startsWith(filenamePrefix))!;
}

export interface UntranspiledImportPath {
  /** e.g. `react` or `./index` */
  path: string;
  /** e.g. `index.tsx` or `model.ts` */
  filename: null | string;
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
      'There is no restriction on typings.'
    ].join(' '),
    startLineNumber: startLine,
    startColumn: startCol,
    endLineNumber: startLine,
    endColumn: startCol + path.length + 2,
    severity: 8,
  };
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
  
  let values: (typeof lookup[0])[];

  while ((values = Object.values(lookup)).length) {
    const level = values
      .filter(({ dependencies, filename }) =>
        dependencies.every(dep => dep === filename || dep in permittedDeps))
      .map(({ filename }) => filename);
    stratification.push(level);

    level.forEach((filename) => {
      delete lookup[filename];
      permittedDeps[filename] = true;
    });
  }

  console.log({ stratification });
  return stratification;
}

export function patchTranspilations(
  jsFile: KeyedLookup<TranspiledJsFile>,
  stratification: string[][],
) {
  const filenameToBlobUrl = {} as Record<string, string>;
  const jsFilenames = Object.keys(jsFile);
  const filenameToPatchedCode = {} as Record<string, string>;

  for (const level of stratification) {
    for (const filename of level) {
      const { transpiled } = jsFile[filename];
      const patchedCode = patchTranspiledCode(
        transpiled.dst,
        transpiled.imports,
        filenameToBlobUrl,
        jsFilenames,
      );
      filenameToPatchedCode[filename] = patchedCode;
      const blob = new Blob([patchedCode], { type: 'text/javascript' });
      const url = URL.createObjectURL(blob);
      filenameToBlobUrl[filename] = url;
      console.log({ patchedCode });
    }
  }

  return filenameToPatchedCode;
}

function patchTranspiledCode(
  transpiledCode: string,
  importMetas: JsImportMeta[],
  filenameToBlobUrl: Record<string, string>,
  jsFilenames: string[],
): string {
  let offset = 0, next: string;
  let patched = transpiledCode;
  importMetas.forEach((importMeta) => {
    const { value, start } = importMeta.path;
    const filename = relPathToFilename(value, jsFilenames);
    if (value === 'react') {
      next = `${window.location.origin}/es-react/react.js`;
    } else if (filename && filenameToBlobUrl[filename]) {
      next = filenameToBlobUrl[filename];
    } else {
      throw Error(`Unexpected import meta ${JSON.stringify(importMeta)}`);
    }
    
    patched = replaceImportAt(patched, value, start + offset, next);
    offset += (next.length - value.length - 1);
  });
  return patched;
}

function replaceImportAt(code: string, prev: string, at: number, next: string) {
  return `${code.slice(0, at - 1)}"${next}"${code.slice(at + prev.length + 2)}`;
}
