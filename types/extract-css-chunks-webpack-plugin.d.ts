declare module 'extract-css-chunks-webpack-plugin' {
  import webpack from 'webpack';

  interface Options extends webpack.Output {
    moduleFilename?: (meta: { name: string }) => string;
  }

  export default class ExtractCssChunks extends webpack.Plugin {
    public static loader: string;
    constructor(opts: Options);
  }
}
