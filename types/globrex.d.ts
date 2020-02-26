declare module 'globrex' {

  interface Options {
    extended?: boolean;
    globstar?: boolean;
    strict?: boolean;
    flags?: string;
    filepath?: boolean;
  }

  export default function(glob: string, opts?: Options): { regex: RegExp };

}
