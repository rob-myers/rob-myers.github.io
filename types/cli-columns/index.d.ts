/**
 * https://www.npmjs.com/package/cli-columns
 */
 declare module 'cli-columns' {
  
  interface CliColumnsOpts {
    /** Max width of list. */
    width?: number;
  }

  function cliColumns(values: string[], opts?: CliColumnsOpts): string;

  export default cliColumns;
}
