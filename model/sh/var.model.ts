import { FileWithMeta } from './parse/parse.model';

export type NamedFunction = {
  /** Function name. */
  key: string;
  /** The source code of the body of the function, e.g. `{ echo foo; }` */
  src: null | string;
  node: FileWithMeta;
}

export const varRegex = /^[a-z_][a-z0-9_-]*$/i;

export const STAGE_KEY = 'STAGE_KEY';
export const PROFILE = 'PROFILE';
