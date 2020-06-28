import { KeyedLookup } from '@model/generic.model';
import { PrefixedStyleFile } from './dev-env.model';

/** Assume import paths are filenames (no relative paths) */
export function findUnknownScssImport(filename: string, file: KeyedLookup<PrefixedStyleFile>) {
  const found = file[filename].prefixed.importIntervals.find(x => !(x.value in file));
  return found?.value || null;
}

export type CyclicScssResult = (
  | { key: 'success'; stratification: string[][] }
  | TraverseScssError & { dependency: string }
);

export function traverseScssDeps(
  f: PrefixedStyleFile,
  file: KeyedLookup<PrefixedStyleFile>,
  dependents: KeyedLookup<PrefixedStyleFile>,
  maxDepth: number
): null | TraverseScssError {
  if (maxDepth <= 0) {
    return null;
  } 
  
  const unknownImport = findUnknownScssImport(f.key, file);
  if (unknownImport) {
    return { key: 'error', errorKey: 'import-unknown', inFilename: f.key, fromFilename: unknownImport };
  } else if (f.key in dependents) {
    return { key: 'error', errorKey: 'cyclic-dep', dependent: f.key };
  }
  
  for (const { value: filename } of f.prefixed.importIntervals) {
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

  const lookup = scssFiles.reduce((agg, { key, prefixed: { importIntervals } }) => ({
    ...agg, [key]: { filename: key, dependencies: importIntervals.map(({ value }) => value) }
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