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

  type SassResult = (
    | SassResultSuccess
    | SassResultError
  );

  interface SassResultSuccess {
    // status 0 means everything is ok,
    // any other value means an error occurred
    status: 0;
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

  interface SassResultError {
    // status other than 0 means an error occured
    status: number;
    // the file the problem occurred in
    file: string | 'stdin';
    // the line the problem occurred on
    line: number;
    // the character on the line the problem started with
    column: number;
    // the problem description
    message: string;
    // human readable formatting of the error
    formatted: string;
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
