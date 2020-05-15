import webpack from 'webpack';
// import path from 'path';

/**
 * Based on https://github.com/microsoft/fluentui/blob/master/packages/monaco-editor
 */
export default function({ entry }: webpack.Configuration): webpack.Configuration {
  return {
    entry () {
      return (entry as any)().then((entry: Record<string, string>) => {
        return {
          ...entry,
          // 'editor.worker': './monaco/esm/vs/editor/editor.worker.js',
          // 'ts.worker': './monaco/esm/vs/language/typescript/ts.worker.js',
          // 'css.worker': './monaco/esm/vs/language/css/css.worker.js',
          // 'html.worker': './monaco/esm/vs/language/html/html.worker.js',
          // 'json.worker': './monaco/esm/vs/language/json/json.worker.js',
        };
      });
    },
    output: {
      globalObject: 'self',
    },
    resolve: {
      alias: {
      },
    },
  };
}
