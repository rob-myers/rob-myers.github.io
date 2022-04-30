// Utils from service/geomorph which don't depend on imports

export const doorEntryDelta = 10;

/** @param {Geomorph.LayoutKey} layoutKey */
export function geomorphJsonPath(layoutKey) {
  return `/geomorph/${layoutKey}.json`
}

/** @param {Geomorph.LayoutKey} layoutKey */
export function geomorphPngPath(layoutKey, suffix = '') {
  return `/geomorph/${layoutKey}${suffix ? `.${suffix}` : ''}.png`
}

export const labelMeta = {
  sizePx: 11,
  /** Text has no tail if it doesn't contain g, j, p, q or y */
  noTailPx: 10,
  font: `${11}px sans-serif`,
  padX: 4,
  padY: 2,
};

/**
 * @param {{ tags: string[]; poly: Geom.Poly }[]} singles 
 * @param {string} tag Restrict to singles with this tag
 */
export function singlesToPolys(singles, tag) {
  return filterSingles(singles, tag).map(x => x.poly);
}

/**
 * @param {{ tags: string[]; poly: Geom.Poly }[]} singles 
 * @param {string} tag Restrict to singles with this tag
 */
export function filterSingles(singles, tag) {
  return singles.filter(x => x.tags.includes(tag));
}
