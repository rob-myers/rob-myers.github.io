/**
 * Based on:
 * https://github.com/zeit/next-plugins/blob/master/packages/next-sass/index.js
 * https://github.com/zeit/next-plugins/blob/master/packages/next-css/css-loader-config.js
 */
import webpack from 'webpack';
import ExtractCssChunks from 'extract-css-chunks-webpack-plugin';
import OptimizeCssAssetsWebpackPlugin from 'optimize-css-assets-webpack-plugin';
import { WebpackCtxt } from './next.model';

export default function({
  isServer,
  dev,
  defaultLoaders,
}: WebpackCtxt): webpack.Configuration {

  const cssLoader = ({ useModules }: { useModules: boolean }): webpack.RuleSetRule => ({
    loader: 'css-loader',
    options: {
      modules: useModules ? {
        localIdentName: dev ? '[name]__[local]' : '[hash:base64]',
      } : false,
      sourceMap: dev,
      // importLoaders: 2, // 'postcss-loader' and 'sass-loader'
      importLoaders: 1, // 'sass-loader'
      onlyLocals: isServer,
      localsConvention: 'camelCase',
    },
  });

  const styleLoader: webpack.RuleSetRule = {
    loader: 'style-loader',
    options: { injectType: 'singletonStyleTag' },
  };

  const eccLoader: webpack.RuleSetRule = {
    loader: ExtractCssChunks.loader,
    options: {
      hmr: dev,
    },
  };

  defaultLoaders.npmCss = [
    ...(!isServer && !dev ? [eccLoader] : []),
    ...(!isServer && dev ? [styleLoader] : []),
    cssLoader({ useModules: false }),
  ];

  return {
    ...(
      !dev && {
        optimization: {
          minimizer: [
            new OptimizeCssAssetsWebpackPlugin({
              cssProcessorOptions: {
                discardComments: { removeAll: true }
              }
            })
          ]
        }
      }
    ),
    module: {
      rules: [
        {
          test: /node_modules.+\.css$/,
          use: defaultLoaders.npmCss
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          use: [
            {
              loader: require.resolve('url-loader'),
              options: {
                limit: 8192,
                fallback: require.resolve('file-loader'),
                publicPath: `${''}/_next/static/chunks/fonts/`,
                outputPath: `${isServer ? '../' : ''}static/chunks/fonts/`,
                name: '[name]-[hash].[ext]'
              }
            }
          ]
        },
      ],
    }
  };
}
