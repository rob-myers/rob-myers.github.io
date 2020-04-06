
import webpack from 'webpack';
import { WebpackCtxt } from './next.config';

export default function(_: WebpackCtxt): webpack.Configuration {
  return {
    module: {
      rules: [
        {
          test: /\.svg$/,
          loader: 'svg-inline-loader',
          options: {
            removingTagAttrs: ['viewBox'],
          }
        }
      ],
    }
  };
}
