import cheerio, { CheerioAPI, Element } from 'cheerio';
import { RectJson, GeoJsonPolygon } from '../geom/types';
import { ParsedSymbol, SvgJson, ParsedSvgJson } from './types';
import { Poly, Rect, Mat } from '../geom';
import { svgPathToPolygons } from '../service';

/**
 * @param {string} symbolName
 * @param {string} svgContents
 * @param {boolean} [debug]
 * @returns {ParsedSymbol<Poly>}
 */
export function parseStarshipSymbol(symbolName, svgContents, debug) {
  const $ = cheerio.load(svgContents);

  const topNodes = Array.from($('svg > *'));
  const pngRect = extractPngOffset($, topNodes);
  const hulls = extractGeoms($, topNodes, 'hull');
  const hull = Poly.union(hulls);
  const doors = extractGeoms($, topNodes, 'doors');
  const irisValves = extractGeoms($, topNodes, 'iris-valves');
  const labels = extractGeoms($, topNodes, 'labels');
  const obstacles = extractGeoms($, topNodes, 'obstacles');
  const walls = extractGeoms($, topNodes, 'walls');
  // console.log({ url, hull });

  return {
    key: symbolName,
    doors,
    hull,
    irisValves,
    labels,
    obstacles,
    hullRect: hull[0]?.rect,
    pngRect,
    /** Original svg with png data url; very useful during geomorph creation */
    svgInnerText: debug ? topNodes.map(x => $.html(x)).join('\n') : undefined,
    walls,
  };
}

/**
 * @param {ParsedSymbol<Poly>} parsed
 * @returns {ParsedSymbol<GeoJsonPolygon>}
 */
export function serializeSymbol(parsed) {
  return {
    key: parsed.key,
    hull: toJsons(parsed.hull),
    doors: toJsons(parsed.doors),
    irisValves: toJsons(parsed.irisValves),
    labels: toJsons(parsed.labels),
    obstacles: toJsons(parsed.obstacles),
    hullRect: parsed.hullRect,
    pngRect: parsed.pngRect,
    svgInnerText: parsed.svgInnerText,
    walls: toJsons(parsed.walls),
  };
}

/**
 * @param {ParsedSymbol<GeoJsonPolygon>} parsed
 * @returns {ParsedSymbol<Poly>}
 */
export function deserializeSymbol(parsed) {
  return {
    key: parsed.key,
    hull: parsed.hull.map(Poly.from),
    doors: parsed.doors.map(Poly.from),
    irisValves: parsed.irisValves.map(Poly.from),
    labels: parsed.labels.map(Poly.from),
    obstacles: parsed.obstacles.map(Poly.from),
    hullRect: parsed.hullRect,
    pngRect: parsed.pngRect,
    svgInnerText: parsed.svgInnerText,
    walls: parsed.walls.map(Poly.from),
  };
}

/** @param {SvgJson} svgJson  */
export function deserializeSvgJson(svgJson) {
  return Object.values(svgJson).reduce(
    (agg, item) => (agg[item.key] = deserializeSymbol(item)) && agg,
    /** @type {ParsedSvgJson} */ ({}),
  );
}

/**
 * @param {Poly[]} polys
 * @param {string[]} [tags]
 */
export function restrictByTags(polys, tags) {
  return tags
    ? polys.filter(x => x.meta?.title.startsWith('has-') && tags.includes(x.meta.title))
    : polys;
}

/**
 * @param {CheerioAPI} api
 * @param {Element[]} topNodes
 * @param {string} title
 */
function extractGeoms(api, topNodes, title) {
  const group = topNodes.find(x => hasTitle(api, x, title));
  return api(group).children('rect, path').toArray()
    .flatMap(x => extractGeom(api, x))
}

/**
 * @param {CheerioAPI} api
 * @param {Element} el
 * @returns {Poly[]}
 */
function extractGeom(api, el) {
  const { tagName, attribs: a } = el;
  const polys = /** @type {Poly[]} */ ([]);
  const title = api(el).children('title').text() || undefined;

  if (tagName === 'rect') {
    const poly = Poly.fromRect(new Rect(Number(a.x || 0), Number(a.y || 0), Number(a.width || 0), Number(a.height || 0)));
    polys.push(poly.addMeta({ title }));
  } else if (tagName === 'path') {
    polys.push(...svgPathToPolygons(a.d).map(x => x.addMeta({ title })));
  } else {
    console.warn('extractGeom: unexpected tagName:', tagName);
  }
  // DOMMatrix not available server-side
  // const m = new DOMMatrix(a.transform);
  const m = new Mat(a.transform);
  // console.log(a.transform, m);
  return polys.map(p => p.applyMatrix(m));
}

/**
 * @param {CheerioAPI} api
 * @param {Element[]} topNodes
 * @returns {RectJson}
 */
 function extractPngOffset(api, topNodes) {
  const group = topNodes.find(x => hasTitle(api, x, 'background'));
  const { attribs: a } = api(group).children('image').toArray()[0];
  return {
    x: Number(a.x || 0),
    y: Number(a.y || 0),
    width: Number(a.width || 0),
    height: Number(a.height || 0),
  };
}

/**
 * - Test if node has child <title>{title}</title>,
 * - Additionally add class {title} if so.
 * @param {CheerioAPI} api 
 * @param {Element} node 
 * @param {string} title 
 */
 function hasTitle(api, node, title) {
  return api(node).children('title').text() === title && api(node).addClass(title)
}

/** @param {Poly[]} polys */
function toJsons(polys) {
  return polys.map(x => x.geoJson);
}
