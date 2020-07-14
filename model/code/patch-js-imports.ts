import { KeyedLookup, pluck } from '@model/generic.model';
import { IMarkerData } from '@model/monaco/monaco.model';
import { TranspiledCodeFile, CodeFileEsModule, CodeFile, StyleFile, FileState, SourcePathInterval, getBlobUrl } from './dev-env.model';

export function getCyclicDepMarker(
  { path, line: startLine, startCol }: SourcePathInterval,
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

export type JsImportMeta = {
  key: 'import-decl';
  path: ModuleSpecifierMeta;
} & (
  | { names: { name: string; alias: string | null }[] }
  | { namespace: string }
  | { defaultAlias: string }
)

export type JsExportMeta = (
  | TsExportSymb
  | TsExportDecl
  | TsExportAsgn
);

interface TsExportSymb {
  key: 'export-symb';
  name: string;
  type: string | null;
}

type TsExportDecl = {
  key: 'export-decl';
  /** Can export from another module */
  from: ModuleSpecifierMeta;
} & (
  | { names: { name: string; alias: string | null }[] }
  | { namespace: string }
)

interface TsExportAsgn {
  key: 'export-asgn';
  name: 'default';
  type: string;
}

export function isTsExportDecl(x: JsExportMeta): x is TsExportDecl {
  return x.key === 'export-decl';
}

export interface ModuleSpecifierMeta {
  /** e.g. `react` or `./index` */
  value: string;
  /** First character of path excluding quotes */
  start: number;
  startLine: number;
  startCol: number;
}

/** Relative paths to code filenames, ignoring 'react' */
export function importPathsToCodeFilenames(
  /** May include .scss */
  importPaths: string[],
  allFilenames: string[]
) {
  return importPaths
    .filter((x, i) => x.startsWith('./') && i === importPaths.indexOf(x))
    .map(x => relPathToFilename(x, allFilenames))
    .filter(x => /\.tsx?$/.test(x));
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
 * Is some `dependent` a transitive-dependency of file `f`?
 * If so we return the first one found.
 */
export function traverseDeps(
  f: CodeFile,
  file: KeyedLookup<CodeFile>,
  dependents: KeyedLookup<CodeFile>,
  maxDepth: number
): null | { key: 'dep-cycle'; dependent: string } {
  if (!f.transpiled || maxDepth <= 0) {
    return null;
  } else if (f.key in dependents) {
    return { key: 'dep-cycle', dependent: f.key };
  }

  for (const filename of f.transpiled.exportFilenames) {
    if (filename in dependents) {
      return { key: 'dep-cycle', dependent: f.key };
    }
  }
  for (const filename of f.transpiled.importFilenames) {
    const error = traverseDeps(file[filename], file, dependents, maxDepth - 1);
    if (error) return error;
  }
  return null;
}

type DepNode = { filename: string; dependencies: string[] };

/**
 * Stratify files by dependencies.
 * We've ensured they are non-cyclic and valid.
 */
export function stratifyJsFiles(jsFiles: TranspiledCodeFile[]) {
  const stratification = [] as string[][];
  const permittedDeps = { react: true } as Record<string, true>;

  const lookup = jsFiles.reduce(( agg, { key, transpiled: { importFilenames, exportFilenames } }) => ({
    ...agg, [key]: {
      filename: key,
      dependencies: importFilenames.concat(exportFilenames),
    },
  }), {} as Record<string, DepNode>);
  
  let values: DepNode[];
  while ((values = Object.values(lookup)).length) {
    const level = values
      .filter(({ dependencies }) => dependencies.every(dep => dep in permittedDeps))
      .map(({ filename }) => filename);
    stratification.push(level);

    level.forEach((filename) => {
      delete lookup[filename];
      permittedDeps[filename] = true;
    });
  }

  console.log({ jsStratification: stratification });
  return stratification;
}

export function patchTranspiledJsFiles(
  file: KeyedLookup<FileState>,
  stratification: string[][],
) {
  const allFilenames = Object.keys(file);
  const filenameToPatched = {} as Record<string, CodeFileEsModule>;
  const scssFile = pluck(file, ({ ext }) => ext === 'scss') as KeyedLookup<StyleFile>;

  for (const level of stratification) {
    for (const filename of level) {
      const { transpiled } = file[filename] as TranspiledCodeFile;
      const patchedCode = patchTranspiledCode(
        transpiled.dst,
        transpiled.imports,
        transpiled.exports,
        filenameToPatched, // Only need blobUrls
        allFilenames,
        scssFile, // Only need blobUrls
      );

      filenameToPatched[filename] = { patchedCode, blobUrl: getBlobUrl(patchedCode) };
      console.log({ patchedCode });
    }
  }

  return filenameToPatched;
}

/**
 * Replace 'react' with static module path.
 * Replace import/export module specifiers with blob urls.
 */
function patchTranspiledCode(
  transpiledCode: string,
  importMetas: JsImportMeta[],
  exportMetas: JsExportMeta[],
  filenameToPatched: Record<string, CodeFileEsModule>,
  allFilenames: string[],
  scssFile: KeyedLookup<StyleFile>,
): string {
  let offset = 0, nextValue: string;
  let patched = transpiledCode;

  importMetas.map(x => x.path).concat(
    exportMetas.filter(isTsExportDecl).map(x => x.from),
  ).forEach((meta) => {
    const { value, start } = meta;
    const filename = relPathToFilename(value, allFilenames);
    if (value === 'react') {
      nextValue = `${window.location.origin}/runtime-modules/react-facade.js`;
    } else if (filename && filenameToPatched[filename]) {
      nextValue = filenameToPatched[filename].blobUrl;
    } else if (filename.endsWith('.scss')) {
      nextValue = scssFile[filename].cssModule!.blobUrl;
    } else {
      throw Error(`Unexpected import/export meta ${JSON.stringify(meta)}`);
    }
    
    patched = replaceImportAt(patched, value, start + offset, nextValue);
    offset += (nextValue.length - value.length - 1);
  });

  return patched;
}

function replaceImportAt(code: string, prev: string, at: number, next: string) {
  return `${code.slice(0, at - 1)}"${next}"${code.slice(at + prev.length + 2)}`;
}
