import webpack from 'webpack';
import { WebpackCtxt } from './next.model';

export default function({}: WebpackCtxt): webpack.Configuration {

  return {
    module: {
      rules: [
        {
          test: /\.svg$/,
          loader: 'svg-inline-loader',
          options: {
            removingTagAttrs: ['viewBox'],
          }
        },
        {
          test: /\.(png|jpeg)$/,
          loader: 'url-loader?limit=8192',
        },
      ],
    }
  };
}
