import { KeyedLookup, pluck } from '@model/generic.model';
import { IMarkerData } from '@model/monaco/monaco.model';
import * as Dev from './dev-env.model';

export function getCyclicDepMarker(
  { value, interval: { startLine, startCol} }: Dev.ModuleSpecifierInterval,
): IMarkerData {
  return {
    message: 'Cyclic dependencies are unsupported. There is no restriction on typings.',
    startLineNumber: startLine,
    startColumn: startCol,
    endLineNumber: startLine,
    endColumn: startCol + value.length + 2,
    severity: 8,
  };
}

/**
 * We ignore module specifiers that don't resolve to a code file.
 * We also remove any duplicates.
 */
export function moduleSpecsToCodeFilenames(
  filename: string,
  file: Record<string, Dev.FileState>,
  moduleSpecs: string[],
) {
  return moduleSpecs.map(x => Dev.resolvePath(filename, x))
    .filter((x, i, xs) => !x.endsWith('.scss') && i === xs.indexOf(x))
    .map(x => file[`${x}.tsx`]?.key || file[`${x}.ts`]?.key)
    .filter(Boolean);
}

/**
 * For example:
 * - `./app` to `app.tsx`
 * - `./foo/model` to `foo/model.ts`
 * - `../index.scss` to `index.scss`
 * - `@module/core/util` to `module/core/util`.
 */
function moduleSpecToFilename(
  filename: string,
  file: Record<string, Dev.FileState>,
  moduleSpec: string,
) {
  const resolved = Dev.resolvePath(filename, moduleSpec);
  return (
    file[resolved]?.key
    || file[`${resolved}.tsx`]?.key
    || file[`${resolved}.ts`]?.key
  );
}

/**
 * Is some `dependent` a transitive-dependency of file `f`?
 * If so we return the first one found.
 */
export function traverseDeps(
  f: Dev.CodeFile,
  file: KeyedLookup<Dev.CodeFile>,
  dependents: KeyedLookup<Dev.CodeFile>,
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
export function stratifyJsFiles(jsFiles: Dev.TranspiledCodeFile[]) {
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
  file: KeyedLookup<Dev.FileState>,
  stratification: string[][],
) {
  const filenameToPatched = {} as Record<string, Dev.CodeFileEsModule>;
  const scssFile = pluck(file, ({ ext }) => ext === 'scss') as KeyedLookup<Dev.StyleFile>;

  for (const level of stratification) {
    for (const filename of level) {
      const { transpiled } = file[filename] as Dev.TranspiledCodeFile;
      const patchedCode = patchTranspiledCode(
        filename,
        file,
        transpiled,
        filenameToPatched, // Only need blobUrls
        scssFile, // Only need blobUrls
      );

      filenameToPatched[filename] = { patchedCode, blobUrl: Dev.getBlobUrl(patchedCode) };
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
  filename: string,
  file: KeyedLookup<Dev.FileState>,
  transpiled: Dev.CodeTranspilation,
  filenameToPatched: Record<string, Dev.CodeFileEsModule>,
  scssFile: KeyedLookup<Dev.StyleFile>,
): string {
  let offset = 0, nextValue: string;
  let patched = transpiled.dst;

  transpiled.imports.map(x => x.from).concat(
    transpiled.exports.filter(Dev.isTsExportDecl).map(x => x.from),
  ).forEach((meta) => {
    const { value, interval: { start } } = meta;
    const resolved = moduleSpecToFilename(filename, file, value);
    if (resolved && filenameToPatched[resolved]) {
      nextValue = filenameToPatched[resolved].blobUrl;
    } else if (value === 'react') {
      nextValue = `${window.location.origin}/facade/react.facade.js`;
    } else if (value === 'redux') {
      nextValue = `${window.location.origin}/facade/redux.facade.js`;
    } else if (value === 'react-redux') {
      nextValue = `${window.location.origin}/facade/react-redux.facade.js`;
    } else if (resolved && resolved.endsWith('.scss')) {
      nextValue = scssFile[resolved].cssModule!.blobUrl;
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
