import { IPackageGroup } from './packages.model';
import { TsDefaults } from './monaco.model';

/**
 * Load types for React and any other packages.
 */
export function loadTypes(
  supportedPackages: IPackageGroup[],
  { typescriptDefaults }: TsDefaults,
): Promise<void> {
  const promises: Promise<void>[] = [];
  const typesPrefix = `${'file:///'}node_modules/@types`;

  // React types must be loaded first (don't use import() to avoid potential bundling issues)
  promises.push(
    new Promise<void>(resolve =>
      require.ensure([], require => {
        // raw-loader 0.x exports a single string, and later versions export a default.
        // The package.json specifies 0.x, but handle either just in case.
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const result: string | { default: string } = require('!raw-loader!@types/react/index.d.ts');
        typescriptDefaults.addExtraLib(
          typeof result === 'string' ? result : result.default,
          `${typesPrefix}/react/index.d.ts`,
        );
        resolve();
      }),
    ),
  );

  // Load each package and add it to TS (and save path mappings to add to TS later)
  const pathMappings: { [path: string]: string[] } = {};
  for (const group of supportedPackages) {
    for (const pkg of group.packages) {
      const { packageName, loadTypes } = pkg;
      // Get the pretend @types package name
      // (for a scoped package like @uifabric/utilities, this will be uifabric__utilities)
      const scopedMatch = packageName.match(/^@([^/]+)\/(.*)/);
      const typesPackageName = scopedMatch ? `${scopedMatch[1]}__${scopedMatch[2]}` : packageName;

      // Call the provided loader function
      promises.push(
        Promise.resolve(loadTypes()).then(contents => {
          const indexPath = `${typesPrefix}/${typesPackageName}/index`;
          // This makes TS automatically find typings for package-level imports
          typescriptDefaults.addExtraLib(contents, `${indexPath}.d.ts`);
          // But for deeper path imports, we likely need to map them back to the root index file
          // (do still include '*' as a default in case the types include module paths--
          // api-extractor rollups don't do this, but other packages' typings might)
          // https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping
          pathMappings[packageName + '/lib/*'] = ['*', indexPath];
        }),
      );
    }
  }

  return Promise.all(promises).then(() => {
    // Add the path mappings
    typescriptDefaults.setCompilerOptions({
      ...typescriptDefaults.getCompilerOptions(),
      paths: pathMappings,
    });
  });
}