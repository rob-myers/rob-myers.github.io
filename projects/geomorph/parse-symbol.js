import cheerio, { CheerioAPI, Element } from 'cheerio';
import { Poly, Rect, Mat } from '../geom';
import { svgPathToPolygons } from '../service';

/**
 * @param {string} symbolName
 * @param {string} svgContents
 * @param {boolean} [debug]
 * @returns {Geomorph.ParsedSymbol<Poly>}
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

  return {
    key: symbolName,
    hull,
    doors,
    irisValves,
    labels,
    obstacles,
    walls,
    meta: {
      doors: doors.map((/** @type {*} */ x) => x._title),
      hullRect: hull[0]?.rect,
      pngRect,
      svgInnerText: debug ? topNodes.map(x => $.html(x)).join('\n') : undefined,
    },
  };
}

/**
 * @param {Geomorph.ParsedSymbol<Poly>} parsed
 * @returns {Geomorph.ParsedSymbol<Geom.GeoJsonPolygon>}
 */
export function serializeSymbol(parsed) {
  return {
    key: parsed.key,
    hull: toJsons(parsed.hull),
    doors: toJsons(parsed.doors),
    irisValves: toJsons(parsed.irisValves),
    labels: toJsons(parsed.labels),
    obstacles: toJsons(parsed.obstacles),
    walls: toJsons(parsed.walls),
    meta: parsed.meta,
  };
}

/**
 * @param {Geomorph.ParsedSymbol<Geom.GeoJsonPolygon>} json
 * @returns {Geomorph.ParsedSymbol<Poly>}
 */
export function deserializeSymbol(json) {
  return {
    key: json.key,
    hull: json.hull.map(Poly.from),
    doors: json.doors.map(Poly.from),
    irisValves: json.irisValves.map(Poly.from),
    labels: json.labels.map(Poly.from),
    obstacles: json.obstacles.map(Poly.from),
    walls: json.walls.map(Poly.from),
    meta: json.meta,
  };
}

/** @param {Geomorph.SvgJson} svgJson  */
export function deserializeSvgJson(svgJson) {
  return Object.values(svgJson).reduce(
    (agg, item) => (agg[item.key] = deserializeSymbol(item)) && agg,
    /** @type {Geomorph.ParsedSvgJson} */ ({}),
  );
}

/**
 * @param {Poly[]} polys
 * @param {(null | string)[]} polysTitles
 * @param {string[]} [tags]
 */
export function restrictByTags(polys, polysTitles, tags) {
  if (tags) {
    return polysTitles.flatMap((title, i) =>
      !title || !title.startsWith('has-')
        ? polys[i]
        : tags.includes(title) ? [polys[i]] : []
    );
  } else {
    return polys;
  }
}

/**
 * @param {CheerioAPI} api
 * @param {Element[]} topNodes
 * @param {string} title
 */
function extractGeoms(api, topNodes, title) {
  const group = topNodes.find(x => hasTitle(api, x, title));
  const children = api(group).children('rect, path').toArray();
  return children.flatMap(x => extractGeom(api, x));
}

/**
 * @param {CheerioAPI} api
 * @param {Element} el
 */
function extractGeom(api, el) {
  const { tagName, attribs: a } = el;
  const output = /** @type {Poly[]} */ ([]);
  const _title = api(el).children('title').text() || null;

  if (tagName === 'rect') {
    const poly = Poly.fromRect(new Rect(Number(a.x || 0), Number(a.y || 0), Number(a.width || 0), Number(a.height || 0)))
    output.push(Object.assign(poly, { _title }));
  } else if (tagName === 'path') {
    const polys = svgPathToPolygons(a.d);
    output.push(...polys.map(p => Object.assign(p, { _title })));
  } else {
    console.warn('extractGeom: unexpected tagName:', tagName);
  }
  // DOMMatrix not available server-side
  // const m = new DOMMatrix(a.transform);
  const m = new Mat(a.transform);
  return output.map(poly => poly.applyMatrix(m));
}

/**
 * @param {CheerioAPI} api
 * @param {Element[]} topNodes
 * @returns {Geom.RectJson}
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
