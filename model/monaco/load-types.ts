import { TypescriptDefaults } from './monaco.model';
const typesPrefix = 'file:///node_modules/@types';

export function loadReactTypes(typescriptDefaults: TypescriptDefaults) {
  return new Promise<void>(resolve =>
    require.ensure([], require => {
      typescriptDefaults.addExtraLib(
        require('!raw-loader!@types/react/index.d.ts').default,
        `${typesPrefix}/react/index.d.ts`,
      );
      resolve();
    }),
  );
}

/**
 * TODO load types of imported modules
 */
