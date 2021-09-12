import cheerio, { CheerioAPI, Element } from 'cheerio';
import { Poly, Rect, Mat } from '../geom';
import { svgPathToPolygons } from '../service';

/**
 * @param {Geomorph.LayoutDef} def
 * @param {Geomorph.SymbolLookup} lookup
 * @returns {Geomorph.Layout}
 */
export function createLayout(def, lookup) {
  /** @type {Geomorph.Layout['actual']} */
  const actual = {
    doors: [],
    labels: [],
    obstacles: [],
    walls: [],
  };
  const m = new Mat;

  def.items.forEach((item) => {
    if (item.hull) return;
    item.transform ? m.feedFromArray(item.transform) : m.setIdentity();
    m.a *= 0.2, m.b *= 0.2, m.c *= 0.2, m.d *= 0.2;
    const { doors, labels, obstacles, walls, meta } = lookup[item.symbol];
    const taggedDoors = restrictByTags(doors, meta.doors, item.tags);
    actual.doors.push(...taggedDoors.map(x => x.clone().applyMatrix(m)));
    actual.labels.push(...labels.map(x => x.clone().applyMatrix(m)));
    actual.obstacles.push(...obstacles.map(x => x.clone().applyMatrix(m)));
    actual.walls.push(...walls.map(x => x.clone().applyMatrix(m)));
  });

  actual.walls = Poly.cutOut(actual.doors, actual.walls);
  const symbols = def.items.map(x => lookup[x.symbol]);
  const hullSymbol = symbols[0];
  const hullOutline = hullSymbol.hull[0].clone().removeHoles();

  const navPoly = Poly.cutOut(
    actual.walls.concat(hullSymbol.hull).flatMap(x => x.createOutset(12.5))
      .concat(actual.obstacles.flatMap(x => x.createOutset(5))),
    [hullOutline],
  );

  return {
    def,
    actual,
    navPoly,
    
    hullRect: /** @type {Geom.RectJson} */ (hullSymbol.meta.hullRect),
    pngHref: `/debug/${def.key}.png`,
    pngRect: hullSymbol.meta.pngRect,

    symbols: symbols.map((sym, i) => ({
      key: sym.key,
      pngHref: `/symbol/${sym.key}.png`,
      pngRect: sym.meta.pngRect,
      transformArray: def.items[i].transform,
      transform: def.items[i].transform ? `matrix(${def.items[i].transform})` : undefined,
    })),
  };
}

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
  const hulls = Poly.union(extractGeoms($, topNodes, 'hull'));
  const doors = extractGeoms($, topNodes, 'doors');
  const labels = extractGeoms($, topNodes, 'labels');
  const obstacles = Poly.union(extractGeoms($, topNodes, 'obstacles'));
  const walls = Poly.union(extractGeoms($, topNodes, 'walls'));
  
  return {
    key: symbolName,
    hull: hulls,
    doors,
    labels,
    obstacles,
    walls,
    meta: {
      doors: doors.map((/** @type {*} */ x) => x._ownTags),
      hullRect: hulls[0]?.rect,
      pngRect,
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
    /** @type {Geomorph.SymbolLookup} */ ({}),
  );
}

/**
 * @param {Poly[]} polys
 * @param {string[][]} polysTags
 * @param {string[]} [tags]
 */
export function restrictByTags(polys, polysTags, tags) {
  if (tags) {
    return polysTags.flatMap((ownTags, i) =>
      ownTags.length
        ? ownTags.some(tag => tags.includes(tag)) ? polys[i] : []
        : polys[i]
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
  const title = api(el).children('title').text() || null;
  const _ownTags = title ? title.split(' ') : [];

  if (tagName === 'rect') {
    const poly = Poly.fromRect(new Rect(Number(a.x || 0), Number(a.y || 0), Number(a.width || 0), Number(a.height || 0)))
    output.push(Object.assign(poly, { _ownTags }));
  } else if (tagName === 'path') {
    const polys = svgPathToPolygons(a.d);
    output.push(...polys.map(p => Object.assign(p, { _ownTags })));
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
