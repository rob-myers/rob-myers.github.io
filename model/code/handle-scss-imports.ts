import { KeyedLookup } from '@model/generic.model';
import { PrefixedStyleFile } from './dev-env.model';

/** Assume import paths are filenames (no relative paths) */
export function findUnknownScssImport(filename: string, file: KeyedLookup<PrefixedStyleFile>) {
  const found = file[filename].prefixed.importIntervals.find(x => !(x.value in file));
  return found?.value || null;
}

export type CyclicScssResult = (
  | { key: 'success'; stratification: string[][] }
  | { key: 'error' } & (
    | { errorKey: 'import-unknown'; filename: string; unknownImport: string }
    | { errorKey: 'cyclic-dep'; dependency: string; dependent: string }
  )
);

export function traverseScssDeps(
  _f: PrefixedStyleFile,
  _file: KeyedLookup<PrefixedStyleFile>,
  _dependents: KeyedLookup<PrefixedStyleFile>,
  _maxDepth: number
): null | TraverseScssResult {

  return {
    key: 'error',
    errorKey: 'cyclic-dep',
    dependent: 'fake.file',
  };
}

type TraverseScssResult = (
  | { key: 'error'; errorKey: 'cyclic-dep'; dependent: string }
);
