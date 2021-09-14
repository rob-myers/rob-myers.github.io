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
    singles: [],
    hull: [],
    obstacles: [],
    walls: [],
  };
  const m = new Mat;

  def.items.forEach((item, i) => {
    item.transform ? m.feedFromArray(item.transform) : m.setIdentity();
    if (i) {// We don't scale 1st item i.e. hull
      m.a *= 0.2, m.b *= 0.2, m.c *= 0.2, m.d *= 0.2;
    }
    const { singles, obstacles, walls } = lookup[item.symbol];
    // Transform singles and restrict doors by tags
    actual.singles.push(...singles
      .map(({ tags, poly }) => ({ tags, poly: poly.clone().applyMatrix(m) }))
      .filter(({ tags }) => !item.tags || !tags.includes('door') || tags.some(tag => item.tags?.includes(tag))))
    actual.obstacles.push(...obstacles.map(x => x.clone().applyMatrix(m)));
    actual.walls.push(...walls.map(x => x.clone().applyMatrix(m)));
  });
  // Ensure well-signed polygons
  actual.obstacles.forEach(d => d.sign() < 0 && d.reverse());
  actual.singles.forEach(({ poly }) => poly.sign() < 0 && poly.reverse());
  // Cut doors from walls
  const doors = filterSingles(actual, 'door');
  actual.walls = Poly.cutOut(doors, actual.walls);

  const symbols = def.items.map(x => lookup[x.symbol]);
  const hullSym = symbols[0];
  const hullOutline = hullSym.hull.map(x => x.clone().removeHoles());
  const windows = filterSingles(actual, 'window');
  const hullTop = Poly.cutOut(windows.concat(doors), hullSym.hull);

  const navPoly = Poly.cutOut(
    actual.walls.flatMap(x => x.createOutset(12))
      .concat(actual.obstacles.flatMap(x => x.createOutset(8))),
    hullOutline,
  );

  return {
    def,
    actual,
    navPoly,
    
    hullTop,
    hullRect: Rect.from(...hullSym.hull.concat(doors).map(x => x.rect)),
    pngHref: `/debug/${def.key}.png`,
    pngRect: hullSym.pngRect,

    symbols: symbols.map((sym, i) => ({
      key: sym.key,
      pngHref: `/symbol/${sym.key}.png`,
      pngRect: sym.pngRect,
      transformArray: def.items[i].transform,
      transform: def.items[i].transform ? `matrix(${def.items[i].transform})` : undefined,
    })),
  };
}

/**
 * @param {string} symbolName
 * @param {string} svgContents
 * @returns {Geomorph.ParsedSymbol<Poly>}
 */
export function parseStarshipSymbol(symbolName, svgContents) {
  const $ = cheerio.load(svgContents);
  const topNodes = Array.from($('svg > *'));
  const singles = extractGeoms($, topNodes, 'singles');
  const hull = extractGeoms($, topNodes, 'hull');
  const labels = extractGeoms($, topNodes, 'labels');
  const obstacles = Poly.union(extractGeoms($, topNodes, 'obstacles'));
  const walls = extractGeoms($, topNodes, 'walls');
  const pngRect = extractPngOffset($, topNodes);

  return {
    key: symbolName,
    hull: Poly.union(hull),
    obstacles,
    walls: Poly.union(walls),
    singles: singles.map((/** @type {*} */ poly) =>({ tags: poly._ownTags, poly })),
    pngRect,
  };
}

/**
 * @param {Geomorph.Layout['actual']} actual 
 * @param {string} tag 
 */
export function filterSingles(actual, tag) {
  return actual.singles.filter(x => x.tags.includes(tag)).map(x => x.poly);
}

/**
 * @param {Geomorph.ParsedSymbol<Poly>} parsed
 * @returns {Geomorph.ParsedSymbol<Geom.GeoJsonPolygon>}
 */
export function serializeSymbol(parsed) {
  return {
    key: parsed.key,
    hull: toJsons(parsed.hull),
    obstacles: toJsons(parsed.obstacles),
    walls: toJsons(parsed.walls),
    singles: parsed.singles.map(({ tags, poly }) => ({ tags, poly: poly.geoJson })),
    pngRect: parsed.pngRect,
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
    obstacles: json.obstacles.map(Poly.from),
    walls: json.walls.map(Poly.from),
    singles: json.singles.map(({ tags, poly }) => ({ tags, poly: Poly.from(poly) })),
    pngRect: json.pngRect,
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
