/** Depth of cursor highlight */
export const wallDepth = 1;

/** How far to inset when constructing navigable poly `floors` */
export const floorInset = 2;

export const doorOutset = 1.999;

/** Dimension of large tile in pixels */
export const tileDim = 60;

/** `tileDim` divided by 3 */
export const smallTileDim = 20;

/** Tags which require rebuild of floor */
export const rebuildTags = ['door', 'horiz', 'vert'];

/** Tags which can affect navigation */
export const navTags = ['steiner', 'door', 'horiz', 'vert'];

export const metaPointRadius = 0.5;
