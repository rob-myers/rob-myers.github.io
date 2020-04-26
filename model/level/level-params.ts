import { RectTag, NavTag } from './level-meta.model';

/** Depth of cursor highlight */
export const cursorWallDepth = 1;



/** How far to inset when constructing navigable poly `floors` */
export const floorInset = 2;

export const doorOutset = floorInset - 0.001;

export const tableOutset = 1;

/** Dimension of tile */
export const tileDim = 20;

/** Tags which require rebuild of floor */
export const rebuildTags: RectTag[] = ['cut', 'door', 'hz', 'table', 'vt'];

/** Tags which can affect navigation */
export const navTags = (rebuildTags as NavTag[]).concat('steiner');

export const metaPointRadius = 0.5;
