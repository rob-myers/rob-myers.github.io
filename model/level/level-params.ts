/** Depth of cursor highlight */
export const wallDepth = 2;

/** How far to inset when constructing navigable poly `floors` */
export const floorInset = 5;

export const blockInset = 5;

/** Dimension of large tile in pixels */
export const tileDim = 60;

/** `tileDim` divided by 3 */
export const smallTileDim = 20;

/** Tags which require rebuild of floor */
export const rebuildTags = ['block'];

/** Tags which can affect navigation */
export const navTags = ['steiner', 'block'];

export const metaPointRadius = 0.5;
