/**
 * Base on https://dev.to/swyx/how-to-add-monaco-editor-to-a-next-js-app-ha3
 */
import webpack from 'webpack';

import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin';
import nextTranspileModules from 'next-transpile-modules';
import { NextJsConfig } from './next.model';

/**
 * `monaco-editor` isn't published to npm correctly: it includes both CSS
 * imports and non-Node friendly syntax, so it needs to be compiled.
 */
export const withMonaco = nextTranspileModules(
  ['monaco-editor']
) as (config: NextJsConfig) => NextJsConfig;

export default function({ entry, module }: webpack.Configuration): webpack.Configuration {
  type Rule = { issuer: { include: any[] }};

  // Find the global CSS loader
  const globalCssRule = module?.rules.find(rule => rule.oneOf)?.oneOf!.find(
    r => (r as RecursivePartial<Rule>).issuer?.include?.includes('_app' as any)
  ) as Rule | undefined;

  if (globalCssRule) {
    globalCssRule.issuer.include = [
      globalCssRule.issuer.include,
      // Allow `monaco-editor` to import global CSS:
      /[\\/]node_modules[\\/]monaco-editor[\\/]/,
    ];
  }

  return {
    entry () {
      return (entry as any)().then((entry: Record<string, string>) => {
        return { ...entry, /** Can extend entry */ };
      });
    },
    plugins: [
      new MonacoWebpackPlugin({
        languages: [
          'json',
          'css',
          'typescript',
          'javascript',
          'html',
        ],
        filename: 'static/[name].worker.js'
      })
    ],
  };
}

type RecursivePartial<T> = {
  [P in keyof T]?:
  T[P] extends (infer U)[] ? RecursivePartial<U>[] :
    T[P] extends object ? RecursivePartial<T[P]> :
      T[P];
};
