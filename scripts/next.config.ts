import path from 'path';
import webpack from 'webpack';
import webpackMerge from 'webpack-merge';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import WebpackBar from 'webpackbar';

import configMisc from './misc.config';
import { NextJsConfigCtxt, Phase, NextJsConfig, WebpackCtxt } from './next.model';

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
              '@public': path.resolve(__dirname, 'public'),
              '@blog': path.resolve(__dirname, 'blog'),
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
        {
          ...(!options.isServer && { node: { fs: 'empty' } as any }),
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
        {
          plugins: [
            // Webpack build info
            new WebpackBar({
              fancy: true,
              profile: true,
              basic: false,
            }),
            // Ignore 3rd party errors
            new webpack.ContextReplacementPlugin(
              // @node_modules/mvdan-sh/index.js
              // Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
              /\/mvdan-sh/,
              (data: any) => {
                delete data.dependencies[0].critical;
                return data;
              },
            ),            
          ],          
        },
        configMisc(options),
      );
    }
  };

  return nextJsConfig;
};
