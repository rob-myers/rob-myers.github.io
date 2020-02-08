/// <reference types="../types/extract-css-chunks-webpack-plugin" />

/**
 * Based on:
 * https://github.com/zeit/next-plugins/blob/master/packages/next-sass/index.js
 * https://github.com/zeit/next-plugins/blob/master/packages/next-css/css-loader-config.js
 */
import webpack from 'webpack';
import ExtractCssChunks from 'extract-css-chunks-webpack-plugin';
import OptimizeCssAssetsWebpackPlugin from 'optimize-css-assets-webpack-plugin';
import { WebpackCtxt } from './next.config';
// import { resolve } from 'path';

export default function({
  isServer,
  dev,
  defaultLoaders,
}: WebpackCtxt): webpack.Configuration {

  const cssLoader: webpack.RuleSetLoader = {
    loader: 'css-loader',
    options: {
      modules: {
        localIdentName: dev
          ? '[path][name]__[local]'
          : '[hash:base64]',
      },
      sourceMap: dev,
      // importLoaders: 2, // 'postcss-loader' and 'sass-loader'
      importLoaders: 1, // 'sass-loader'
      onlyLocals: isServer,
      localsConvention: 'camelCase',
    },
  };

  // const postCssLoader: webpack.RuleSetLoader = {
  //   loader: 'postcss-loader',
  //   options: {
  //     config: {
  //       path: resolve(__dirname, 'postcss.config.js'),
  //     },
  //   },
  // };

  const eccLoader: webpack.RuleSetLoader = {
    loader: ExtractCssChunks.loader,
    options: {
      hmr: dev,
    },
  };

  defaultLoaders.sass = [
    ...(isServer ? [] : [eccLoader]),
    cssLoader,
    // postCssLoader,
    { loader: 'sass-loader', options: {} }
  ];

  return {
    ...(
      !isServer && {
        optimization: {
          splitChunks: {
            cacheGroups: {
              styles: {
                name: 'styles',
                test: /\.(scss|sass)$/,
                chunks: 'all',
                enforce: true
              }
            }
          }
        },
        plugins: [
          new ExtractCssChunks({
            filename: dev
              ? 'static/chunks/[name].css'
              : 'static/chunks/[name].[contenthash:8].css',
            chunkFilename: dev
              ? 'static/chunks/[name].chunk.css'
              : 'static/chunks/[name].[contenthash:8].chunk.css',
          })
        ],
        
      }
    ),
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
          test: /\.scss$/,
          use: defaultLoaders.sass
        },
        {
          test: /\.sass$/,
          use: defaultLoaders.sass
        }
      ],
    }
  };
}
