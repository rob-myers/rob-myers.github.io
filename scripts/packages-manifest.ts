/**
 * Build the global manifest.json for public/packages.
 * In development we'll run this script on-the-fly.
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import path from 'path';
import { Project, ts } from 'ts-morph';

import { publicDir, packagesDir, manifestPath, PackagesManifest } from '../model/dev-env/manifest.model';
import { Graph, BaseNode } from '../model/graph.model';

updateManifest();

function updateManifest() {
  const prevManifest = getPrevManifest();
  const nextManifest = getNextManifest();
  const nextContents = prettyJson(nextManifest);

  if (prettyJson(prevManifest) !== nextContents) {
    writeFileSync(manifestPath, nextContents);
    console.log(`updated packages manifest "${manifestPath}"`);
  }
}

function getNextManifest(): PackagesManifest {
  /** e.g. `public/packages/shared/util.ts` but not `public/packages/mock-reducer.ts` */
  const allPaths = getDescendentPaths(packagesDir).filter((x) => x.split('/').length > 3);
  /** e.g. `shared` sans dups */
  const allPackages = allPaths.map(pathToPackageName).filter((x, i, xs) => xs.indexOf(x) === i);

  const project = new Project({ compilerOptions: { jsx: ts.JsxEmit.React } });

  const packageToDeps = {} as Record<string, Record<string, true>>;
  for (const filePath of allPaths) {
    const packageName = pathToPackageName(filePath);
    const srcFile = project.createSourceFile(filePath, readFileSync(filePath).toString(), { overwrite: true });
    [ ...srcFile.getImportDeclarations().map(x => x.getModuleSpecifier().getText().slice(1, -1)),
      ...srcFile.getExportDeclarations().filter(x => x.hasModuleSpecifier())
        .map(x => x.getModuleSpecifier()!.getText().slice(1, -1)),
    ].filter(x => x.startsWith('@package/')).forEach(x =>
      (packageToDeps[packageName] = (packageToDeps[packageName] || {}))[moduleSpecToPackageName(x)] = true);
  }

  const edgePairs = allPackages.flatMap(srcKey => Object.keys(packageToDeps[srcKey] || {})
    .map(next => [srcKey, next] as [string, string]));
  const graph = Graph.createBasicGraph(allPackages, edgePairs);
  // Fail if @packages have a cyclic dependency
  graph.throwOnCycle('@packages have cyclic dependency');

  return {
    packages: allPackages
      .reduce<PackagesManifest['packages']>((agg, packageName) => ({
        ...agg, [packageName]: {
          key: packageName,
          files: allPaths.map(x => path.relative(publicDir, x))
            .filter(x => x.startsWith(`packages/${packageName}/`)),
          dependencies: Object.keys(packageToDeps[packageName] || {}),
          transitiveDeps: graph
            .getReachableNodes(graph.getNodeById(packageName)!, { withoutFirst: true })
            .map(({ key }) => key)
        },
      }), {}),
  };
}

function getPrevManifest(): PackagesManifest | null {
  try {
    const contents = readFileSync(manifestPath).toString();
    return JSON.parse(contents) as PackagesManifest;
  } catch (e) {
    return null;
  }
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

/** e.g. `public/packages/shared/foo` --> `shared` */
function pathToPackageName(filePath: string) {
  return filePath.split('/')[2];
}

/** e.g. `@package/shared/foo` --> `shared` */
function moduleSpecToPackageName(moduleSpec: string) {
  return moduleSpec.split('/')[1];
}

function prettyJson(serializable: any) {
  return JSON.stringify(serializable, null, '\t');
}
