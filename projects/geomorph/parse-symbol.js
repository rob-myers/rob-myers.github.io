import cheerio, { CheerioAPI, Element } from 'cheerio';
import { Poly, Rect, Vect, Mat } from '../geom';
import { svgPathToPolygons } from '../service';

/**
 * @param {string} svgContents
 * @param {string[]} [tags]
 * @param {boolean} [debug]
 */
export function parseStarshipSymbol(svgContents, tags, debug) {
  const $ = cheerio.load(svgContents);

  const topNodes = Array.from($('svg > *'));
  const hull = extractGeoms($, topNodes, 'hull');
  const doors = extractGeoms($, topNodes, 'doors', tags);
  const walls = extractGeoms($, topNodes, 'walls');
  const obstacles = extractGeoms($, topNodes, 'obstacles');
  const irisValves = extractGeoms($, topNodes, 'iris-valves');
  const labels = extractGeoms($, topNodes, 'labels');
  const pngOffset = extractPngOffset($, topNodes);
  // console.log({ url, hull });

  return {
    /** Original svg with png data url; very useful during geomorph creation */
    svgInnerText: debug ? topNodes.map(x => $.html(x)).join('\n') : '',
    /** Assumed connected, if exists */
    hull: Poly.union(hull),
    doors,
    irisValves,
    labels,
    obstacles,
    pngOffset,
    walls,
  };
}

/**
 * @param {CheerioAPI} api
 * @param {Element[]} topNodes
 * @param {string} title
 * @param {string[]} [tags]
 */
function extractGeoms(api, topNodes, title, tags) {
  const group = topNodes.find(x => hasTitle(api, x, title));
  return api(group).children('rect, path').toArray()
    .flatMap(x => extractGeom(api, x))
    .filter(x => matchesTag(x.meta?.title, tags));
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
    console.warn('extractPoly: unexpected tagName:', tagName);
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
 */
 function extractPngOffset(api, topNodes) {
  const group = topNodes.find(x => hasTitle(api, x, 'background'));
  const { attribs: a } = api(group).children('image').toArray()[0];
  return new Vect(Number(a.x || 0), Number(a.y || 0));
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

/**
 * @param {string | undefined} title
 * @param {string[] | undefined} tags
 */
function matchesTag(title, tags) {
  return !tags || !title || (
    title.startsWith('has-') && tags.includes(title.slice(4))
  );
}