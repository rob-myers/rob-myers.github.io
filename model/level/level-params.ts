import { RectTag, NavTag } from './level-meta.model';

/** Depth of cursor highlight */
export const cursorWallDepth = 1;

/** Issues with fractional 3d 'pixels' */
export const wallDepth = 1;

/** How far to inset when constructing navigable poly `floors` */
export const floorInset = 10;

export const doorOutset = floorInset - 0.01;

export const tableOutset = 5;

/** Dimension of tile */
export const tileDim = 100;

/** Tags which require rebuild of floor */
export const rebuildTags: RectTag[] = ['cut', 'door', 'hz', 'table', 'vt'];

/** Tags which can affect navigation */
export const navTags = (rebuildTags as NavTag[]).concat('steiner');

export const metaPointRadius = 0.5 * 5;
