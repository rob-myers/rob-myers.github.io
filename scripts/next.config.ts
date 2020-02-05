// eslint-disable-next-line no-unused-vars
import webpack from 'webpack';
import webpackMerge from 'webpack-merge';
import nextConst from 'next/constants';
import path from 'path';

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
    opts: any
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

const production = process.env.NODE_ENV === 'production';
console.log({ production });

export default (
  _phase: Phase,
  _opts: { defaultConfig: NextJsConfig }
): NextJsConfig => {

  return {
    webpack: (config) => webpackMerge(
      config,
      {
        resolve: {
          alias: {
            '@components': path.resolve(__dirname, 'components'),
            '@store': path.resolve(__dirname, 'store'),
            '@custom-types': path.resolve(__dirname, 'custom-types'),
            ...(!production && { 'react-dom': '@hot-loader/react-dom' })
          }
        }
      }
    )
  };
};
