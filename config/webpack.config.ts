import path from "path";
import fs from "fs";

import webpack from "webpack";
import HTMLWebpackPlugin from "html-webpack-plugin";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";

// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/27570#issuecomment-474628163
import { Configuration as WebpackConfiguration } from "webpack";
import { Configuration as WebpackDevServerConfiguration } from "webpack-dev-server";
interface Configuration extends WebpackConfiguration {
  devServer?: WebpackDevServerConfiguration;
}

/**
 * Used to ignore spurious warnings.
 */
import { IgnoreNotFoundExportPlugin } from "./webpack.patch";

const dev = process.env.NODE_ENV !== "production";
console.log({ dev });

const https = process.env.NODE_USE_PROTOCOL === "https";
console.log({ https });

/**
 * Resolve {filepath} relative to root directory.
 */
const resolve = (filepath: string) => path.resolve(__dirname, "..", filepath);

const htmlWebpackPluginConfig = new HTMLWebpackPlugin({
  template: resolve("index.html"),
  filename: "index.html",
  inject: true
});

const definePluginConfig = new webpack.DefinePlugin({
  "process.env": {
    NODE_ENV: JSON.stringify(dev ? "development" : "production")
  }
});

const webpackConfig: Configuration = {
  devServer: dev
    ? {
        host: "localhost",
        port: 3000,
        hot: true,
        inline: true,
        headers: {
          // 'Access-Control-Allow-Origin': '*',
        },
        historyApiFallback: true,
        https: https
          ? {
              key: fs.readFileSync(resolve("config/server.key")),
              cert: fs.readFileSync(resolve("config/server.crt"))
            }
          : undefined
        // setup: function(app) {
        //   app.use(function(req, res, next) {
        //     // console.log('Middleware triggered');
        //     next();
        //   });
        // },
      }
    : {},

  // devtool: dev ? "cheap-module-eval-source-map" : undefined,
  devtool: dev ? "eval-source-map" : undefined,

  entry: ["react-hot-loader/patch", resolve("src/index.tsx")],

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "babel-loader",
        options: {
          // /**
          //  * In order to transpile ../shared we have added babel.config.js to the repo root.
          //  */
          // rootMode: "upward"
        }
      },
      {
        enforce: "pre",
        test: /\.js$/,
        loader: "source-map-loader",
        /**
         * https://github.com/aws-amplify/amplify-js/issues/433#issuecomment-372723436
         */
        exclude: /node_modules/
      },
      {
        test: /\.scss$/,
        loader: "style-loader!css-loader!sass-loader"
      },
      // {
      //   test: /\.(jpe?g|png|gif|svg)$/i,
      //   loader: "url-loader",
      //   options: {
      //     limit: 10000,
      //   }
      // },
      /**
       * "file loader" ensures assets get served by WebpackDevServer.
       * When you import an asset, you get its (virtual) filename.
       * In production they get copied to the build folder.
       */
      {
        test: /\.(woff|woff2|png|svg)/,
        loader: require.resolve("file-loader"),
        options: {
          name: "static/media/[name].[hash:8].[ext]"
        }
      }
    ]
  },

  optimization: {
    minimizer: dev ? [] : [new TerserPlugin()],
    splitChunks: {
      chunks: "initial"
    }
  },

  resolve: {
    alias: {
      "react-dom": "@hot-loader/react-dom",
      /**
       * Aligned to tsconfig.json.
       */
      "@src": resolve("src")
    },
    extensions: [".ts", ".tsx", ".js"]
  },

  output: {
    filename: "index.js",
    path: resolve("build")
  },

  mode: dev ? "development" : "production",
  node: {
    fs: "empty"
  },

  plugins: [
    htmlWebpackPluginConfig,
    ...(dev
      ? [
          new webpack.HotModuleReplacementPlugin(),
          /**
           * Careful: might lose meaningful messages too.
           * https://github.com/TypeStrong/ts-loader/issues/653#issuecomment-390889335
           */
          new IgnoreNotFoundExportPlugin(),
          new ForkTsCheckerWebpackPlugin({
            tslint: true
          })
        ]
      : []),
    definePluginConfig
  ]
};

export default webpackConfig;
