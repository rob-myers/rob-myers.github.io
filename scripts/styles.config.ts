/**
 * Based on:
 * https://github.com/zeit/next-plugins/blob/master/packages/next-sass/index.js
 * https://github.com/zeit/next-plugins/blob/master/packages/next-css/css-loader-config.js
 */
import webpack from 'webpack';
import ExtractCssChunks from 'extract-css-chunks-webpack-plugin';
import OptimizeCssAssetsWebpackPlugin from 'optimize-css-assets-webpack-plugin';
import { WebpackCtxt } from './next.model';

// const noCssModulesRegexes = [
//   /\/monaco-override\.scss$/,
//   /\/golden-layout\.scss$/,
// ];

export default function({
  isServer,
  dev,
  defaultLoaders,
}: WebpackCtxt): webpack.Configuration {

  const cssLoader = ({ useModules }: { useModules: boolean }): webpack.RuleSetLoader => ({
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

  // const postCssLoader: webpack.RuleSetLoader = {
  //   loader: 'postcss-loader',
  //   options: {
  //     config: {
  //       path: resolve(__dirname, 'postcss.config.js'),
  //     },
  //   },
  // };

  const styleLoader: webpack.RuleSetLoader = {
    loader: 'style-loader',
    options: { injectType: 'singletonStyleTag' },
  };

  const eccLoader: webpack.RuleSetLoader = {
    loader: ExtractCssChunks.loader,
    options: {
      hmr: dev,
    },
  };

  defaultLoaders.sass = [
    ...(!isServer && !dev ? [eccLoader] : []),
    ...(!isServer && dev ? [styleLoader] : []),
    cssLoader({ useModules: true }),
    // postCssLoader,
    { loader: 'sass-loader', options: {} }
  ];

  defaultLoaders.npmCss = [
    ...(!isServer && !dev ? [eccLoader] : []),
    ...(!isServer && dev ? [styleLoader] : []),
    cssLoader({ useModules: false }),
  ];

  return {
    ...(
      !isServer && {
        optimization: {
          splitChunks: {
            cacheGroups: {
              styles: {
                name: 'styles',
                test: /\.(sa|sc)ss$/,
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
          test: /\.(sa|sc|c)ss$/,
          // exclude: { or: [/node_modules/].concat(noCssModulesRegexes) },
          use: defaultLoaders.sass
        },
        {
          test: /node_modules.+\.css$/,
          use: defaultLoaders.npmCss
        },
        // {
        //   test: { or: noCssModulesRegexes },
        //   use: [
        //     'style-loader',
        //     { loader: 'css-loader', options: { importLoaders: 1 } },
        //     'sass-loader',
        //   ],
        // },
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
