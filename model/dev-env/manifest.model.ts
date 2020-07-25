import { KeyedLookup } from '../generic.model';

export const publicDir = 'public';
export const packagesDir = 'public/packages';
export const manifestPath = 'public/packages/manifest.json';
export const manifestWebPath = '/packages/manifest.json';

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
   * A package is a project iff its root directory contains
   * files `reducer.ts` and `app.tsx`.
   */
  project: boolean;
  /**
   * Transitive closure of `dependencies`.
   * We do not support cyclic dependencies.
   */
  transitiveDeps: string[];
}
