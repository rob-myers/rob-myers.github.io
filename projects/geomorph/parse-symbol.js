import cheerio, { CheerioAPI, Element } from 'cheerio';
import { VectJson, GeoJsonPolygon } from '../geom/types';
import { ParsedSymbol} from './types';
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
  const pngOffset = extractPngOffset($, topNodes);
  const hull = extractGeoms($, topNodes, 'hull');
  const doors = extractGeoms($, topNodes, 'doors');
  const irisValves = extractGeoms($, topNodes, 'iris-valves');
  const labels = extractGeoms($, topNodes, 'labels');
  const obstacles = extractGeoms($, topNodes, 'obstacles');
  const walls = extractGeoms($, topNodes, 'walls');
  // console.log({ url, hull });

  return {
    symbolName,
    /** Original svg with png data url; very useful during geomorph creation */
    svgInnerText: debug ? topNodes.map(x => $.html(x)).join('\n') : undefined,
    pngOffset,
    hull: Poly.union(hull),
    doors,
    irisValves,
    labels,
    obstacles,
    walls,
  };
}

/**
 * @param {ParsedSymbol<Poly>} parsed
 * @returns {ParsedSymbol<GeoJsonPolygon>}
 */
export function serializeSymbol(parsed) {
  return {
    symbolName: parsed.symbolName,
    svgInnerText: parsed.svgInnerText,
    hull: toJsons(parsed.hull),
    doors: toJsons(parsed.doors),
    irisValves: toJsons(parsed.irisValves),
    labels: toJsons(parsed.labels),
    obstacles: toJsons(parsed.obstacles),
    walls: toJsons(parsed.walls),
    pngOffset: parsed.pngOffset,
  };
}

/**
 * @param {ParsedSymbol<Poly>} parsed
 * @param {string[]} [tags]
 */
 export function restrictAllByTags(parsed, tags) {
  if (tags) {
    parsed.doors = restrictByTags(parsed.doors, tags);
  }
  return parsed;
}

/**
 * @param {Poly[]} polys
 * @param {string[]} tags
 */
 function restrictByTags(polys, tags) {
  return polys.filter(x =>
    x.meta?.title.startsWith('has-') && tags.includes(x.meta.title)
  );
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
 * @returns {VectJson}
 */
 function extractPngOffset(api, topNodes) {
  const group = topNodes.find(x => hasTitle(api, x, 'background'));
  const { attribs: a } = api(group).children('image').toArray()[0];
  return { x: Number(a.x || 0), y: Number(a.y || 0) };
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
