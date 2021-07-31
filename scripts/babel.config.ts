export default (api: Api): Config => {
  api.cache(true);

  return {
    exclude: [],
    presets: [
      [
        'next/babel',
        {
          'preset-env': {
            targets: {
               esmodules: true,
            },
          },
          'preset-react': {
            runtime: 'automatic',
            importSource: '@emotion/react',
          },
          // https://github.com/babel/babel/issues/11539#issuecomment-626381058
          // 'transform-runtime': {},
          // 'styled-jsx': {},
          // 'class-properties': {},
          // '@emotion/babel-preset-css-prop': {},
        },
      ],
    ],
    plugins: ['@emotion/babel-plugin']
  };
};

interface Api {
  version: string;
  cache: Function & {
    forever: Function;
    never: Function;
    using: Function;
    invalidate: Function;
  };
  env: Function;
  async: Function;
  caller: Function;
  assertVersion: Function;
  tokTypes: any; 
}

interface Config {
  exclude?: any[];
  overrides?: any[];
  presets: object[];
  plugins: (string | object)[];
}