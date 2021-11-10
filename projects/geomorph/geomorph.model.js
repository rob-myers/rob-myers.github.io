export const labelMeta = {
  sizePx: 11,
  /** Text has no tail if it doesn't contain g, j, p, q or y */
  noTailPx: 10,
  font: `${11}px sans-serif`,
  padX: 4,
  padY: 2,
};

/** @param {Geomorph.LayoutKey} layoutKey */
export function geomorphJsonPath(layoutKey) {
  return `/geomorph/${layoutKey}.json`
}

/** @param {Geomorph.LayoutKey} layoutKey */
export function geomorphPngPath(layoutKey) {
  return `/geomorph/${layoutKey}.png`
}
