import webpack from 'webpack';
import webpackMerge from 'webpack-merge';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import WebpackBar from 'webpackbar';
import withImages from 'next-images';
import withPreact from 'next-plugin-preact';

import configMisc from './misc.config';
import { NextJsConfigCtxt, Phase, NextJsConfig, WebpackCtxt } from './next.model';

const production = process.env.NODE_ENV === 'production';
console.log({ production });

export default (_phase: Phase, _ctxt: NextJsConfigCtxt): NextJsConfig => {

  const nextJsConfig = {
    eslint: {
      // Warning: This allows production builds to successfully complete even if
      // your project has ESLint errors.
      ignoreDuringBuilds: true,
    },
    webpack: (config: webpack.Configuration, options: WebpackCtxt) => {
      return webpackMerge(
        config,
        {
          resolve: {
            fallback: {// Needed by box2d-wasm
              fs: false,
              path: false, 
            }
          },
          // ...(!options.isServer && { resolve: { fallback: { fs: false } } }),
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

  return withImages(withPreact(nextJsConfig));
};
