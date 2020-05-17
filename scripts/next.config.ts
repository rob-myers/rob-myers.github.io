import path from 'path';
import webpackMerge from 'webpack-merge';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import configStyles from './styles.config';
import configOther from './other.config';
import { NextJsConfigCtxt, Phase, NextJsConfig, WebpackCtxt } from './next.model';

import configMonaco from './monaco.config';
import webpack from 'webpack';

const production = process.env.NODE_ENV === 'production';
console.log({ production });

export default (_phase: Phase, _ctxt: NextJsConfigCtxt): NextJsConfig => {

  const nextJsConfig = {
    webpack: (config: webpack.Configuration, options: WebpackCtxt) => {
      return webpackMerge(
        config,
        // Module aliases
        {
          resolve: {
            alias: {
              '@components': path.resolve(__dirname, 'components'),
              '@store': path.resolve(__dirname, 'store'),
              '@model': path.resolve(__dirname, 'model'),
              '@worker': path.resolve(__dirname, 'worker'),
            }
          },
        },
        // Ignore tests
        {
          module: {
            rules: [
              { test: /\.spec\.(ts|tsx)$/, loader: 'ignore-loader' },
            ],
          },
        },
        // Web workers
        {
          output: {
            globalObject: 'self',
          },
          module: {
            rules: [
              {
                test: /\.worker\.ts$/,
                use: [
                  {
                    loader: 'worker-loader',
                    options: {
                      name: 'static/[hash].worker.js',
                      publicPath: '/_next/',
                      // inline: true, fallback: false,
                    }
                  },
                  {
                    loader: 'babel-loader',
                    options: {
                      cacheDirectory: true
                    }
                  }
                ]
              }
            ]
          }
        },
        {
          ...(!options.isServer && { node: { fs: 'empty' } }),
        },
        // Bundle analyzer
        process.env.ANALYZE === 'true' ? {
          plugins: [
            new BundleAnalyzerPlugin({
              analyzerMode: 'static',
              reportFilename: options.isServer
                ? '../analyze/server.html'
                : './analyze/client.html',
            })
          ]
        } : {},
        configStyles(options),
        configOther(options),

        !options.isServer ? configMonaco(config) : {},
      );
    }
  };

  return nextJsConfig;
};
