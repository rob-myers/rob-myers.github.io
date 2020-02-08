declare module 'extract-css-chunks-webpack-plugin' {
  import webpack from 'webpack';

  export default class ExtractCssChunks extends webpack.Plugin {
    public static loader: string;
    constructor(opts: webpack.Output)
  }
}