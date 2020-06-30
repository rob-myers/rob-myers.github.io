import { KeyedLookup } from '@model/generic.model';
import { PrefixedStyleFile } from './dev-env.model';

/**
 * Valid import paths are relative paths `./${filename}`
 * where `filename` exists and has extension `scss`.
 */
export function detectInvalidScssImport(
  filename: string,
  file: KeyedLookup<PrefixedStyleFile>,
) {
  return file[filename].pathIntervals.find(({ value }) =>
    !(/^\.\/.+\.scss$/.test(value) && value.slice(2) in file)) || null;
}

export type ScssImportsResult = (
  | { key: 'success'; stratification: string[][] }
  | SccsImportsError
);

export type SccsImportsError = TraverseScssError & { dependency: string };

export function traverseScssDeps(
  f: PrefixedStyleFile,
  file: KeyedLookup<PrefixedStyleFile>,
  dependents: KeyedLookup<PrefixedStyleFile>,
  maxDepth: number
): null | TraverseScssError {
  if (maxDepth <= 0) {
    return null;
  } 

  const unknownImport = detectInvalidScssImport(f.key, file);
  if (unknownImport) {
    return { key: 'error', errorKey: 'import-unknown', inFilename: f.key, fromFilename: unknownImport.value };
  } else if (f.key in dependents) {
    return { key: 'error', errorKey: 'cyclic-dep', dependent: f.key };
  }
  
  for (const { value } of f.pathIntervals) {
    const filename = value.slice(2);
    const error = traverseScssDeps(file[filename], file, dependents, maxDepth - 1);
    if (error) return error;
  }

  return null;
}

type TraverseScssError = { key: 'error' } & (
  | { errorKey: 'cyclic-dep'; dependent: string }
  | { errorKey: 'import-unknown'; inFilename: string; fromFilename: string }
);

type DepNode = { filename: string; dependencies: string[] };

export function stratifyScssFiles(scssFiles: PrefixedStyleFile[]) {
  const stratification = [] as string[][];
  const permittedDeps = {} as Record<string, true>;

  const lookup = scssFiles.reduce((agg, { key, pathIntervals }) => ({
    ...agg, [key]: { filename: key,
      dependencies: pathIntervals.map(({ value }) => value.slice(2)),
    }
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

  console.log({ scssStratification: stratification });
  return stratification;
}
