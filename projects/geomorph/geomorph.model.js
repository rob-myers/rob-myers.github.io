// Utils from service/geomorph which don't depend on imports

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
 * @param {...(string | string[])} tagOrTags Restrict to singles with any/all of these tags
 */
export function singlesToPolys(singles, ...tagOrTags) {
  return filterSingles(singles, ...tagOrTags).map(x => x.poly);
}

/**
 * @param {{ tags: string[]; poly: Geom.Poly }[]} singles 
 * @param {...(string | string[])} tagOrTags Restrict to singles with any/all of these tags
 */
export function filterSingles(singles, ...tagOrTags) {
  return singles.filter(x => tagOrTags.some(spec =>
    Array.isArray(spec) ? spec.every(tag => x.tags.includes(tag)) : x.tags.includes(spec))
  );
}
