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
  const globalCssRule = module?.rules.find(rule => rule.oneOf)?.oneOf?.find(
    r => (r as Rule).issuer?.include?.includes('_app' as any)
  ) as Rule | undefined;

  if (globalCssRule) {
    globalCssRule.issuer.include = [
      globalCssRule.issuer.include,
      // Allow monaco-editor to import global CSS
      /[\\/]node_modules[\\/]monaco-editor[\\/]/,
    ];
  }

  return {
    plugins: [
      new MonacoWebpackPlugin({
        languages: [
          'css',
          'scss',
          'typescript',
          'javascript',
        ],
        filename: 'static/[name].worker.js',
        features: [
          // 'accessibilityHelp',
          'bracketMatching',
          'caretOperations',
          'clipboard',
          'codeAction',
          'codelens',
          'colorDetector',
          'comment',
          'contextmenu',
          'coreCommands',
          'cursorUndo',
          'dnd',
          'find',
          'folding',
          'fontZoom',
          'format',
          'gotoError',
          'gotoLine',
          'gotoSymbol',
          'hover',
          'iPadShowKeyboard',
          'inPlaceReplace',
          'inspectTokens',
          'linesOperations',
          'links',
          'multicursor',
          'parameterHints',
          'quickCommand',
          'quickOutline',
          'referenceSearch',
          'rename',
          'smartSelect',
          'snippets',
          'suggest',
          'toggleHighContrast',
          'toggleTabFocusMode',
          'transpose',
          'wordHighlighter',
          'wordOperations',
          'wordPartOperations',
        ],
      })
    ],
  };
}
