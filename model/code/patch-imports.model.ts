import { KeyedLookup } from '@model/generic.model';
import { IMarkerData } from '@model/monaco/monaco.model';
import { FileState, TranspiledCodeFile, CodeFileEsm, CodeFile } from './dev-env.model';

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

export interface JsImportMeta {
  type: 'import-decl';
  path: ModuleSpecifierMeta;
  names: { name: string; alias?: string }[];
  namespace?: string;
}

export interface JsExportMeta {
  type: 'export-symb' | 'export-decl' | 'export-asgn';
  names: { name: string; alias?: string }[];
  namespace?: string;
  /** Can export from another module */
  from?: ModuleSpecifierMeta;
}

export interface ModuleSpecifierMeta {
  /** e.g. `react` or `./index` */
  value: string;
  /** First character of path excluding quotes */
  start: number;
  startLine: number;
  startCol: number;
}

/** Relative paths to filenames, ignoring 'react' */
export function relPathsToFilenames(importPaths: string[], allFilenames: string[]) {
  return importPaths
    .filter((x, i) => x.startsWith('./') && i === importPaths.indexOf(x))
    .map(x => relPathToFilename(x, allFilenames));
}

/**
 * e.g. `./index` to `index.tsx` and `./model` to `model.ts`.
 */
export function relPathToFilename(relPath: string, allFilenames: string[]) {
  const filenamePrefix = relPath.slice(2);
  // TODO handle case where one filename is a prefix of another
  return allFilenames.find(y => y.startsWith(filenamePrefix))!;
}

/**
 * Is some `dependent` a transitive-dependency of `f`?
 * If so we return the first one found.
 */
export function traverseDeps(
  f: CodeFile,
  file: KeyedLookup<FileState>,
  dependents: KeyedLookup<CodeFile>,
  maxDepth: number
): null | TraverseDepsError {
  if (maxDepth <= 0 || !f.transpiled) {
    return null;
  } else if (f.key in dependents) {
    return { key: 'dep-cycle', dependent: f.key };
  }

  for (const filename of f.transpiled!.exportFilenames) {
    if (filename in dependents) {
      return { key: 'dep-cycle', dependent: f.key };
    }
  }
  for (const filename of f.transpiled!.importFilenames) {
    const error = traverseDeps(file[filename] as CodeFile, file, dependents, maxDepth - 1);
    if (error) return error;
  }
  return null;
}

type TraverseDepsError = { key: 'dep-cycle'; dependent: string };
export type CyclicDepError = TraverseDepsError & { dependency: string };

type DepNode = { filename: string; dependencies: string[] };

/**
 * Stratify files by dependencies.
 * We've ensured they are non-cyclic and valid.
 */
export function stratifyJsFiles(jsFiles: TranspiledCodeFile[]) {
  const stratification = [] as string[][];
  const permittedDeps = { react: true } as Record<string, true>;

  const lookup = jsFiles.reduce((agg, { key, transpiled: { importFilenames } }) => ({
    ...agg, [key]: { filename: key, dependencies: importFilenames }
  }), {} as Record<string, DepNode>);
  
  let values: DepNode[];

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

export function patchTranspiledJsFiles(
  jsFile: KeyedLookup<TranspiledCodeFile>,
  stratification: string[][],
) {
  const jsFilenames = Object.keys(jsFile);
  const filenameToPatched = {} as Record<string, CodeFileEsm>;

  for (const level of stratification) {
    for (const filename of level) {
      const { transpiled } = jsFile[filename];
      const patchedCode = patchTranspiledCode(
        transpiled.dst,
        transpiled.imports,
        filenameToPatched, // Only need the blobUrls
        jsFilenames,
      );
      const blob = new Blob([patchedCode], { type: 'text/javascript' });
      const blobUrl = URL.createObjectURL(blob);
      filenameToPatched[filename] = { patchedCode, blobUrl };
      console.log({ patchedCode });
    }
  }

  return filenameToPatched;
}

/**
 * Replace 'react' with asset path.
 * Replace relative paths with blob urls.
 */
function patchTranspiledCode(
  transpiledCode: string,
  importMetas: JsImportMeta[],
  filenameToPatched: Record<string, CodeFileEsm>,
  jsFilenames: string[],
): string {
  let offset = 0, nextValue: string;
  let patched = transpiledCode;

  importMetas.forEach((importMeta) => {
    const { value, start } = importMeta.path;
    const filename = relPathToFilename(value, jsFilenames);
    if (value === 'react') {
      nextValue = `${window.location.origin}/es-react/react.js`;
    } else if (filename && filenameToPatched[filename]) {
      nextValue = filenameToPatched[filename].blobUrl;
    } else {
      throw Error(`Unexpected import meta ${JSON.stringify(importMeta)}`);
    }
    
    patched = replaceImportAt(patched, value, start + offset, nextValue);
    offset += (nextValue.length - value.length - 1);
  });
  return patched;
}

function replaceImportAt(code: string, prev: string, at: number, next: string) {
  return `${code.slice(0, at - 1)}"${next}"${code.slice(at + prev.length + 2)}`;
}
