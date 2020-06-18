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

export interface ImportMeta {
  /** Filename */
  key: string;
  items: {
    /** e.g. `react` or `./index` */
    canonicalPath: string;
    /** First character of path including quotes */
    pathStart: number;
    /** Final character of path including quotes */
    pathEnd: number;
    identifier: string;
    alias: null | string;
  }[];
}

export interface ExportMeta {
  /** Filename */
  key: string;
  items: {
    identifier: string;
    alias: null | string;
  }[];
}
