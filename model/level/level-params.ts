/** Depth of cursor highlight */
export const wallDepth = 1;

/** How far to inset when constructing navigable poly `floors` */
export const floorInset = 2;

export const doorOutset = floorInset - 0.001;

/** Dimension of tile */
export const tileDim = 20;

/** Tags which require rebuild of floor */
export const rebuildTags = ['cut', 'door', 'horiz', 'table', 'vert'];

/** Tags which can affect navigation */
export const navTags = rebuildTags.concat('steiner');

export const metaPointRadius = 0.5;
