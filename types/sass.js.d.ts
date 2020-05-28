declare module 'sass.js/dist/sass' {
  
  interface SassOutputOptions {
    // Format output: nested, expanded, compact, compressed
    style?: 'nested' | 'expanded' | 'compact' | 'compressed';
    // Decimal point precision for outputting fractional numbers
    // (-1 will use the libsass default, which currently is 5)
    precision?: -1 | number;
    // If you want inline source comments
    comments?: boolean;
    // String to be used for indentation
    indent?: string;
    // String to be used to for line feeds
    linefeed?: string;
  }

  // interface SassSourcemapOptions {}
  interface SassOptions extends SassOutputOptions {
    // Treat source_string as SASS (as opposed to SCSS)
    indentedSyntax?: boolean;
  }

  interface SassResult {
    // status 0 means everything is ok,
    // any other value means an error occurred
    status: number;
    // the compiled CSS
    text: string;
    // the SourceMap for this compilation
    map: {
      version: number;
      sourceRoot: 'root' | string;
      file: 'stdout' | string;
      sources: string[];
      sourcesContent: string[];
      mappings: string;
      names: string[];
    };
    // the files that were used during the compilation
    files: any[];
  }

  export interface SassWorker {
    options(arg: 'defaults' | SassOptions, callback: () => void): void;
    compile(source: string, callback: (result: SassResult) => void): void;
  }

  interface SassWorkerClass {
    static setWorkerUrl: (url: string) => void;
    new (): SassWorker;
  }
  const SassWorkerClass: SassWorkerClass;

  export default SassWorkerClass;
}
