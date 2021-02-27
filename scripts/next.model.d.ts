import webpack from 'webpack';
import nextConst from 'next/constants';

export type Phase = (
  | typeof nextConst.PHASE_DEVELOPMENT_SERVER
  | typeof nextConst.PHASE_EXPORT
  | typeof nextConst.PHASE_PRODUCTION_BUILD
  | typeof nextConst.PHASE_PRODUCTION_SERVER
)

export type NextJsConfig = Partial<{
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

export interface NextJsConfigCtxt {
  defaultConfig: NextJsConfig;
}

export interface WebpackCtxt {
  defaultLoaders: Record<string, webpack.RuleSetLoader[]>;
  isServer: boolean;
  dev: boolean;
}
