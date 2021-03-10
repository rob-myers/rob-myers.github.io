export default (api: Api): Config => {
  api.cache(true);

  return {
    presets: [
      [
        'next/babel',
        {
          'preset-env': {},
          'transform-runtime': {},
          'styled-jsx': {},
          'class-properties': {},
          '@emotion/babel-preset-css-prop': {},
        },
      ],
    ],
    plugins: []
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
  presets: object[];
  plugins: (string | object)[];
}