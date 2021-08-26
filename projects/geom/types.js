/** @typedef {[number, number]} Coord */

/**
 * @typedef GeoJsonPolygon From the GeoJSON spec,
 * see https://datatracker.ietf.org/doc/html/rfc7946#section-3.1.6.
 * @type {object}
 * @property {'Polygon'} type Identifier amongst GeoJSON formats.
 * @property {Coord[][]} coordinates The 1st array defines the _outer polygon_,
 * the others define non-nested _holes_.
 */

/** @typedef {{ x: number; y: number }} VectJson */

/** @typedef {{ x: number; y: number; width: number; height: number }} RectJson */

/** @typedef {{ vs: import('./vect').Vect[]; tris: [number, number, number][] }} Triangulation */

export {};
