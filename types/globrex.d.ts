declare module 'globrex' {

  interface Options {
    extended?: boolean;
    globstar?: boolean;
    strict?: boolean;
    flags?: string;
    filepath?: boolean;
  }

  export = function(glob: string, opts?: Options): { regex: RegExp };
}
