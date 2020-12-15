import webpack from 'webpack';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { WebpackCtxt } from './next.model';


export default function(options: WebpackCtxt): webpack.Configuration {

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
          test: /\.mdx$/,
          use: [
            options.defaultLoaders.babel as any,
            {
              loader: '@mdx-js/loader',
              options: {
                remarkPlugins: [
                  [remarkMath, { /* options */ }],
                ],
                rehypePlugins: [
                  [rehypeKatex, {/* options */}],
                ],
              },
            },
          ],
        }
      ],
    }
  };
}
