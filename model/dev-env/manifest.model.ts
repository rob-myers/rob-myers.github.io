import { KeyedLookup } from '../generic.model';

export const publicDir = 'public';
export const packagesRootDir = 'public/package';
export const packagesDirName = 'package';
export const manifestPath = 'public/package/manifest.json';
export const manifestWebPath = '/package/manifest.json';

export interface PackagesManifest {
  packages: KeyedLookup<PackageMeta>;
}

interface PackageMeta {
  /** Package name */
  key: string;
  /** Relative to web root e.g. packages/shared/util.ts */
  files: string[];
  /**
   * Package names occurring in some module specifier of `files`.
   * For example `@package/shared/redux.model` yields `shared`.
   * Technically we may only be using typings rather than values.
   */
  dependencies: string[];
  /**
   * Transitive closure of `dependencies`.
   * We do not support cyclic dependencies.
   */
  transitiveDeps: string[];
}
