const supportedFileMetas = [
  { filenameExt: '.tsx', panelKeyPrefix: 'tsx' },
  { filenameExt: '.scss', panelKeyPrefix: 'scss'},
  { filenameExt: '.ts', panelKeyPrefix: 'ts'},
];

export function hasSupportedExtension(filename: string) {
  return supportedFileMetas.some(({ filenameExt }) => filename.endsWith(filenameExt));
}

export function isFilePanel(panelKey: string, filename?: string) {
  return supportedFileMetas.some(({ filenameExt, panelKeyPrefix }) =>
    panelKey.startsWith(panelKeyPrefix) && filename?.endsWith(filenameExt));
}

export function isAppPanel(panelKey: string) {
  return /^app(-|$)/.test(panelKey);
}

export function panelKeyToAppElId(panelKey: string) {
  return `app-render-root-${panelKey}`;
}

/** All imports inside file `key`. */
export interface FileImportsMeta {
  /** Filename */
  key: string;
  items: {
    /** e.g. `react` or `./index` */
    path: string;
    /** First character of path excluding quotes */
    pathStart: number;
    names: {
      name: string;
      alias?: string;
    }[];
    namespace?: string;
  }[];
}

/** All exports inside file `key`. */
export interface FileExportsMeta {
  /** Filename */
  key: string;
  items: {
    names: {
      name: string;
      alias?: string;
    }[];
    namespace?: string;
    /** Can export from another module */
    from?: string;
  }[];
}
