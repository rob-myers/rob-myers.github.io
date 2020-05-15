
import webpack from 'webpack';
import { WebpackCtxt } from './next.model';

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
