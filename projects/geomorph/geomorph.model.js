import cheerio, { CheerioAPI, Element } from 'cheerio';
import { Poly, Rect, Mat } from '../geom';
import { svgPathToPolygons } from '../service';

/**
 * Create a layout, given a definition and all symbols.
 * @param {Geomorph.LayoutDef} def
 * @param {Geomorph.SymbolLookup} lookup
 * @returns {Geomorph.Layout}
 */
export function createLayout(def, lookup) {
  /** @type {Geomorph.Layout['groups']} */
  const groups = { singles: [], obstacles: [], walls: [] };
  const m = new Mat;

  def.items.forEach((item, i) => {
    item.transform ? m.feedFromArray(item.transform) : m.setIdentity();
    const { singles, obstacles, walls, hull } = lookup[item.symbol];
    if (i) {
      /**
       * Starship symbol PNGs are 5 times larger than Geomorph PNGs.
       * Also, the geomorph PNGs correspond to the hull (1st item).
       */
      m.a *= 0.2, m.b *= 0.2, m.c *= 0.2, m.d *= 0.2;
    }
    // Transform singles and restrict doors by tags
    groups.singles.push(...singles
      .map(({ tags, poly }) => ({ tags, poly: poly.clone().applyMatrix(m).precision(1) }))
      .filter(({ tags }) =>
        !item.tags || !tags.includes('door') || tags.some(tag => item.tags?.includes(tag))
      ))
    groups.obstacles.push(...obstacles.map(x => x.clone().applyMatrix(m)));
    groups.walls.push(
      ...walls.map(x => x.clone().applyMatrix(m)),
      ...singlesToPolys(singles, 'wall').map(x => x.clone().applyMatrix(m)),
      // Hull symbol (1st symbol) has "hull" walls
      ...hull.flatMap(x => x.createOutset(2)).map(x => x.applyMatrix(m)),
    );
  });

  // Ensure well-signed polygons
  groups.obstacles.forEach(poly => poly.fixOrientation());
  groups.singles.forEach(({ poly }) => poly.fixOrientation());
  
  // Cut doors from walls
  const doors = singlesToPolys(groups.singles, 'door');
  groups.walls = Poly.cutOut(doors, groups.walls);
  groups.singles = groups.singles.reduce((agg, single) =>
    agg.concat(single.tags.includes('wall')
      ? Poly.cutOut(doors, [single.poly]).map(poly => ({ ...single, poly }))
      : single
    )
  , /** @type {typeof groups['singles']} */ ([]));

  const symbols = def.items.map(x => lookup[x.symbol]);
  const hullSym = symbols[0];
  const hullOutline = hullSym.hull.map(x => x.clone().removeHoles());
  const windows = singlesToPolys(groups.singles, 'window');
  const hullTop = Poly.cutOut(doors.concat(windows), hullSym.hull);

  const navPoly = Poly.cutOut(/** @type {Poly[]} */([]).concat(
    groups.walls.flatMap(x => x.createOutset(12)),
    groups.obstacles.flatMap(x => x.createOutset(8)),
  ), hullOutline).map(x => x.cleanFinalReps().precision(1).fixOrientation());

  return {
    def,
    groups,
    navPoly,
    
    hullTop,
    hullRect: Rect.from(...hullSym.hull.concat(doors).map(x => x.rect)),

    items: symbols.map((sym, i) => ({
      key: sym.key,
      pngHref: i ? `/symbol/${sym.key}.png` : `/debug/${def.key}.png`,
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
  const pngRect = extractPngOffset($, topNodes);

  const singles = extractGeoms($, topNodes, 'singles');
  const hull = extractGeoms($, topNodes, 'hull');
  const obstacles = extractGeoms($, topNodes, 'obstacles');
  const walls = extractGeoms($, topNodes, 'walls');

  return {
    key: symbolName,
    pngRect,
    hull: Poly.union(hull),
    obstacles: Poly.union(obstacles),
    walls: Poly.union(walls),
    singles: singles.map((/** @type {*} */ poly) =>({ tags: poly._ownTags, poly })),
  };
}

/**
 * @param {{ tags: string[]; poly: Poly }[]} singles 
 * @param {string} tag Restrict to singles with this tags
 */
export function singlesToPolys(singles, tag) {
  return  filterSingles(singles, tag).map(x => x.poly);
}

/**
 * @param {{ tags: string[]; poly: Poly }[]} singles 
 * @param {string} tag Restrict to singles with this tags
 */
export function filterSingles(singles, tag) {
  return singles.filter(x => x.tags.includes(tag));
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
