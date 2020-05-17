/**
 * Based on https://dev.to/swyx/how-to-add-monaco-editor-to-a-next-js-app-ha3
 */
import webpack from 'webpack';
import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin';

type Rule = { issuer: { include: any[] }};

export default function(
  { module }: webpack.Configuration,
): webpack.Configuration {

  // Find the global CSS loader
  const globalCssRule = module?.rules.find(rule => rule.oneOf)?.oneOf!.find(
    r => (r as Rule).issuer?.include?.includes('_app' as any)
  ) as Rule | undefined;

  if (globalCssRule) {
    globalCssRule.issuer.include = [
      globalCssRule.issuer.include,
      // Allow `monaco-editor` to import global CSS:
      /[\\/]node_modules[\\/]monaco-editor[\\/]/,
    ];
  }

  return {
    plugins: [
      new MonacoWebpackPlugin({
        languages: [
          'json',
          'css',
          'typescript',
          'javascript',
          'html',
        ],
        filename: 'static/[name].worker.js',
      })
    ],
  };
}
