import { FileWithMeta } from './parse/parse.model';

export type NamedFunction = {
  /** Function name. */
  key: string;
  /** The source code of the body of the function, e.g. `{ echo foo; }` */
  src: null | string;
  node: FileWithMeta;
}

export enum CoreVar {
  STAGE_KEY= 'STAGE_KEY',
  PROFILE= 'PROFILE',
}
