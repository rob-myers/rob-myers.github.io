import path from 'path';
import webpack from 'webpack';
import webpackMerge from 'webpack-merge';
import nextConst from 'next/constants';
import configStyles from './styles.config';

const production = process.env.NODE_ENV === 'production';
console.log({ production });

export default (
  _phase: Phase,
  _nextCtxt: NextJsConfigCtxt
): NextJsConfig => {

  return {
    webpack: (config, options) => {
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
              '@os-service': path.resolve(__dirname, 'model/os/service'),
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
                      publicPath: '/_next/'
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
        configStyles(options),
      );
    }
  };
};

type Phase = (
  | typeof nextConst.PHASE_DEVELOPMENT_SERVER
  | typeof nextConst.PHASE_EXPORT
  | typeof nextConst.PHASE_PRODUCTION_BUILD
  | typeof nextConst.PHASE_PRODUCTION_SERVER
)

type NextJsConfig = Partial<{
  env: string[];
  webpack: (
    config: webpack.Configuration,
    opts: WebpackCtxt,
  ) => webpack.Configuration;
  webpackDevMiddleware: any;
  /** e.g. '.next' */
  distDir: string;
  assetPrefix: string;
  /** e.g. 'default' */
  configOrigin: string;
  /** e.g. true */
  useFileSystemPublicRoutes: true;
  generateBuildId: Function;
  /** e.g. true */
  generateEtags: boolean;
  pageExtensions: any[];
  /** e.g. 'server' */
  target: string;
  /** e.g. true */
  poweredByHeader: boolean;
  /** e.g. true */
  compress: boolean;
  devIndicators: Record<string, any>;
  onDemandEntries: Record<string, any>;
  amp: Record<string, any>;
  /** e.g. false */
  exportTrailingSlash: boolean;
  experimental: Record<string, any>;
  future: Record<string, any>;
  serverRuntimeConfig: {};
  publicRuntimeConfig: {};
}>

interface NextJsConfigCtxt {
  defaultConfig: NextJsConfig;
}

export interface WebpackCtxt {
  defaultLoaders: Record<string, webpack.RuleSetLoader[]>;
  isServer: boolean;
  dev: boolean;
}
