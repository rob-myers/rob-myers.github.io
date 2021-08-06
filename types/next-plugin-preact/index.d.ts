declare module 'next-plugin-preact' {

  interface Arg {
    webpack: (config: webpack.Configuration, options: WebpackCtxt) => webpack.Configuration
  }

  export default function(input: Arg): Arg;
}