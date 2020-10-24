import * as portals from 'react-reverse-portal';

import { FsFile } from '@model/shell/file.model';

export interface Env {
  /** Environment key */
  key: string;
  /**
   * __TODO__ this may still be useful; needs rename
   *
   * Originally created in shell.store `Session`.
   * - world can internally write click events to builtins.
   * - builtins can write messages to change the world.
   */
  worldDevice: FsFile;
}

export interface EnvDef {
  envKey: string;
}

export interface EnvPortal {
  /** Environment key */
  key: string;
  portalNode: portals.HtmlPortalNode;
}
