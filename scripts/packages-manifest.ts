/**
 * Build public/packages/manifest.json.
 * In development we should do this on-the-fly.
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import path from 'path';

const publicDir = 'public';
const packagesDir = 'public/packages';
const manifestPath = 'public/packages/manifest.json';

updateManifest();

function updateManifest() {
  const prevManifest = getPrevManifest();
  const nextManifest = getNextManifest();
  const nextContents = prettyJson(nextManifest);

  if (prettyJson(prevManifest) !== nextContents) {
    console.log(`updating "${manifestPath}"...`);
    writeFileSync(manifestPath, nextContents);
  }
}

function getNextManifest(): Manifest {
  /** Contains e.g. `packages/shared/util.ts` */
  const allPaths = getDescendentPaths(packagesDir)
    .map(x => path.relative(publicDir, x));
  /** Contains e.g. `packages/shared/` */
  const allPackageRoots = allPaths
    .filter((x) => x.split('/').length > 2)
    .map(x => (x.split('/').slice(0, 2).concat('')).join('/'))
    .filter((x, i, xs) => xs.indexOf(x) === i);

  return {
    packages: allPackageRoots
      .reduce<Manifest['packages']>((agg, packageRoot) => ({
        ...agg, [path.basename(packageRoot)]: {
          key: path.basename(packageRoot),
          rootPath: packageRoot,
          files: allPaths.filter(x => x.startsWith(packageRoot))
        },
      }), {}),
  };
}

function getPrevManifest(): Manifest | null {
  try {
    const contents = readFileSync(manifestPath).toString();
    return JSON.parse(contents) as Manifest;
  } catch (e) {
    return null;
  }
}

interface Manifest {
  packages: {
    [packageName: string]: Package;
  };
}

interface Package {
  /** Package name */
  key: string;
  /** Relative to web root e.g. packages/shared/ */
  rootPath: string;
  /** Relative to web root e.g. packages/shared/util.ts */
  files: string[];
}

/**
 * Get all descendent file paths, excluding directories.
 */
function getDescendentPaths(filePath: string): string[] {
  return statSync(filePath).isDirectory()
    ? Array.prototype.concat(
      ...readdirSync(filePath).map(f => getDescendentPaths(path.join(filePath, f))))
    : [filePath];
}

function prettyJson(serializable: any) {
  return JSON.stringify(serializable, null, '\t');
}
