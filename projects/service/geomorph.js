import cheerio, { CheerioAPI, Element } from 'cheerio';
import { createCanvas } from 'canvas';
import { Poly, Rect, Mat } from '../geom';
import { labelMeta } from '../geomorph/geomorph.model';
import { svgPathToPolygon } from './dom';

/**
 * Create a layout, given a definition and all symbols.
 * Can run in browser or on server.
 * @param {Geomorph.LayoutDef} def
 * @param {Geomorph.SymbolLookup} lookup
 * @param {import('./triangle').TriangleService} [triangleService]
 * @returns {Promise<Geomorph.ParsedLayout>}
 */
export async function createLayout(def, lookup, triangleService) {
  const m = new Mat;

  /** @type {Geomorph.ParsedLayout['groups']} */
  const groups = { singles: [], obstacles: [], walls: [] };

  def.items.forEach((item, i) => {
    m.feedFromArray(item.transform || [1, 0, 0, 1, 0, 0]);
    const { singles, obstacles, walls, hull } = lookup[item.symbol];
    if (i) {
      /**
       * Starship symbol PNGs are 5 times larger than Geomorph PNGs.
       * We skip 1st item i.e. hull, which corresponds to a geomorph PNG.
       */
      m.a *= 0.2, m.b *= 0.2, m.c *= 0.2, m.d *= 0.2;
    }
    // Transform singles (restricting doors/walls by tags)
    const restricted = singles
      .map(({ tags, poly }) => ({ tags, poly: poly.clone().applyMatrix(m).precision(4) }))
      .filter(({ tags }) => {
        if (item.doors && tags.includes('door'))
          return tags.some(tag => /** @type {string[]} */ (item.doors).includes(tag));
        else if (item.walls && tags.includes('wall'))
          return tags.some(tag => /** @type {string[]} */ (item.walls).includes(tag));
        return true;
      });
    groups.singles.push(...restricted);
    groups.obstacles.push(...obstacles.map(x => x.clone().applyMatrix(m)));
    groups.walls.push(
      ...Poly.union([
        ...walls.map(x => x.clone().applyMatrix(m)),
        // singles can also have walls e.g. to support optional doors
        ...singlesToPolys(restricted, 'wall'),
        // The hull symbol (the 1st symbol) has "hull" walls
        ...hull.flatMap(x => x.createOutset(2)).map(x => x.applyMatrix(m)),
      ])
    );
  });

  // Ensure well-signed polygons
  groups.singles.forEach(({ poly }) => poly.fixOrientation().precision(4));
  groups.obstacles.forEach(poly => poly.fixOrientation().precision(4));
  groups.walls.forEach((poly) => poly.fixOrientation().precision(4));
  
  // Cut doors from walls
  const doors = singlesToPolys(groups.singles, 'door');
  // Do not union walls yet, as may self-intersect when outset
  // Our polygon outset doesn't support self-intersecting outer ring
  const unjoinedWalls = groups.walls.flatMap(x => Poly.cutOut(doors, [x]));
  const uncutWalls = groups.walls; // Keep a reference to uncut walls
  groups.walls = Poly.union(unjoinedWalls);
  groups.singles = groups.singles.reduce((agg, single) =>
    agg.concat(single.tags.includes('wall')
      ? Poly.cutOut(doors, [single.poly]).map(poly => ({ ...single, poly }))
      : single
    )
  , /** @type {typeof groups['singles']} */ ([]));

  const symbols = def.items.map(x => lookup[x.symbol]);
  const hullSym = symbols[0];
  const hullOutline = hullSym.hull.map(x => x.clone().removeHoles()); // Not transformed
  const windows = singlesToPolys(groups.singles, 'window');

  // Navigation polygon
  const navPoly = Poly.cutOut(/** @type {Poly[]} */([]).concat(
    unjoinedWalls.flatMap(x => x.createOutset(12)), // Use non-unioned walls
    groups.obstacles.flatMap(x => x.createOutset(8)),
  ), hullOutline).map(x => x.cleanFinalReps().fixOrientation().precision(4));

  // Currently triangle-wasm runs server-side only
  const navDecomp = triangleService
    ? await triangleService.triangulate(navPoly, {
      // maxSteiner: 300,
      // minAngle: 10,
      minAngle: 10,
      // maxArea: 10000,
    })
    : { vs: [], tris: [] };

  // Labels
  const measurer = createCanvas(0, 0).getContext('2d');
  measurer.font = labelMeta.font;
  /** @type {Geomorph.LayoutLabel[]} */
  const labels = filterSingles(groups.singles, 'label')
    .map(({ poly, tags }) => {
      const center = poly.rect.center.json;
      const text = tags.filter(x => x !== 'label').join(' ');
      const noTail = !text.match(/[gjpqy]/);
      const dim = { x: measurer.measureText(text).width, y: noTail ? labelMeta.noTailPx : labelMeta.sizePx };
      const rect = { x: center.x - 0.5 * dim.x, y: center.y - 0.5 * dim.y, width: dim.x, height: dim.y };
      const padded = (new Rect).copy(rect).outset(labelMeta.padX, labelMeta.padY).json;
      return { text, center, rect, padded };
    });

  const allWalls = Poly.union(hullSym.hull.concat(uncutWalls, windows));
  const allHoles = allWalls.flatMap(x => x.holes.map(ring => new Poly(ring)));
  // Bit of a hack
  const allHolesWithDoors = allHoles
    .flatMap(hole => Poly.union([hole].concat(doors)))
    .filter(poly => poly.outline.length > 5);
  // TODO associate switches to holes

  return {
    key: def.key,
    id: def.id,
    def,
    groups,
    navPoly,
    navDecomp,
    walls: unjoinedWalls,
    labels,
    allHoles: allHolesWithDoors,
    
    hullPoly: hullSym.hull.map(x => x.clone()),
    hullTop: Poly.cutOut(doors.concat(windows), hullSym.hull),
    hullRect: Rect.from(...hullSym.hull.concat(doors).map(x => x.rect)),

    items: symbols.map(/** @returns {Geomorph.ParsedLayout['items'][0]} */  (sym, i) => ({
      key: sym.key,
      pngHref: i ? `/symbol/${sym.key}.png` : `/debug/${def.key}.png`,
      pngRect: sym.pngRect,
      transformArray: def.items[i].transform,
      transform: def.items[i].transform ? `matrix(${def.items[i].transform})` : undefined,
    })),
  };
}

/** @param {Geomorph.ParsedLayout} layout */
export function serializeLayout({
  def,
  groups, walls, allHoles, labels, 
  navPoly, navDecomp,
  hullPoly, hullRect, hullTop,
  items,
}) {
  /** @type {Geomorph.LayoutJson} */
  const json = {
    key: def.key,
    id: def.id,

    def,
    groups: {
      obstacles: groups.obstacles.map(x => x.geoJson),
      singles: groups.singles.map(x => ({ tags: x.tags, poly: x.poly.geoJson })),
      walls: groups.walls.map(x => x.geoJson),
    },
    navPoly: navPoly.map(x => x.geoJson),
    navDecomp,
    walls: walls.map(x => x.geoJson),
    labels,
    allHoles: allHoles.map(x => x.geoJson),

    hullPoly: hullPoly.map(x => x.geoJson),
    hullRect,
    hullTop: hullTop.map(x => x.geoJson),

    items,
  };
  return json;
}

/** @param {Geomorph.LayoutJson} layout */
export function parseLayout({
  def,
  groups, walls, allHoles, labels, 
  navPoly, navDecomp,
  hullPoly, hullRect, hullTop,
  items,
}) {
  /** @type {Geomorph.ParsedLayout} */
  const parsed = {
    key: def.key,
    id: def.id,

    def,
    groups: {
      obstacles: groups.obstacles.map(Poly.from),
      singles: groups.singles.map(x => ({ tags: x.tags, poly: Poly.from(x.poly) })),
      walls: groups.walls.map(Poly.from),
    },
    navPoly: navPoly.map(Poly.from),
    navDecomp,
    walls: walls.map(Poly.from),
    labels,
    allHoles: allHoles.map(Poly.from),

    hullPoly: hullPoly.map(Poly.from),
    hullRect,
    hullTop: hullTop.map(Poly.from),

    items,
  };
  return parsed;
}

/**
 * @param {string} symbolName
 * @param {string} svgContents
 * @param {number} lastModified
 * @returns {Geomorph.ParsedSymbol<Poly>}
 */
export function parseStarshipSymbol(symbolName, svgContents, lastModified) {
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
    singles: singles.map((/** @type {*} */ poly) => ({ tags: poly._ownTags, poly })),
    lastModified,
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
function filterSingles(singles, tag) {
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
    lastModified: parsed.lastModified,
  };
}

/**
 * @param {Geomorph.ParsedSymbol<Geom.GeoJsonPolygon>} json
 * @returns {Geomorph.ParsedSymbol<Poly>}
 */
function deserializeSymbol(json) {
  return {
    key: json.key,
    hull: json.hull.map(Poly.from),
    obstacles: json.obstacles.map(Poly.from),
    walls: json.walls.map(Poly.from),
    singles: json.singles.map(({ tags, poly }) => ({ tags, poly: Poly.from(poly) })),
    pngRect: json.pngRect,
    lastModified: json.lastModified,
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
  const children = api(group).children('rect, path, ellipse').toArray();
  return children.flatMap(x => extractGeom(api, x)).map(x => x.precision(4));
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
    // Must be a single connected polygon with ≥ 0 holes
    const poly = svgPathToPolygon(a.d);
    poly && output.push(Object.assign(poly, { _ownTags }));
  } else if (tagName === 'ellipse') {
    // Reinterpret ellipse as bounding rectangle (preserves info)
    const poly = Poly.fromRect(new Rect((Number(a.cx) - Number(a.rx)) || 0, (Number(a.cy) - Number(a.ry)) || 0, 2 * Number(a.rx) || 0, 2 * Number(a.ry) || 0))
    output.push(Object.assign(poly, { _ownTags }));
  } else {
    console.warn('extractGeom: unexpected tagName:', tagName, a);
  }
  // DOMMatrix not available server-side
  // const m = new DOMMatrix(a.transform);
  const m = new Mat(a.transform);
  return output.map(poly => poly.applyMatrix(m));
}

/**
 * Each symbol has a copy of the original PNG in group `background`.
 * It may have been offset e.g. so doors are aligned along border.
 * Then we need to extract the respective rectangle.
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
