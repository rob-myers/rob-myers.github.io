import cheerio, { CheerioAPI, Element } from 'cheerio';
import { createCanvas } from 'canvas';
import { keys } from './generic';
import { Poly, Rect, Mat, Vect } from '../geom';
import { extractGeomsAt, hasTitle } from './cheerio';
import { geom } from './geom';
import { labelMeta } from '../geomorph/geomorph.model';
import { RoomGraph } from '../graph/room-graph';
import { Builder } from '../pathfinding/Builder';

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
        return item.doors && tags.includes('door')
          ? tags.some(tag => /** @type {string[]} */ (item.doors).includes(tag))
          : (item.walls && tags.includes('wall'))
            ? tags.some(tag => /** @type {string[]} */ (item.walls).includes(tag))
            : true;
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
  
  /**
   * Cut doors from walls, changing `groups.walls` and `groups.singles`.
   * We do not cut out windows because conceptually easier to have one notion.
   * But when rendering we'll need to avoid drawing wall over window.
   */
  const doorPolys = singlesToPolys(groups.singles, 'door');
  /**
   * We cut doors from walls, without first unioning the walls.
   * We do this because our polygon outset doesn't support self-intersecting outer ring.
   */
  const unjoinedWalls = groups.walls.flatMap(x => Poly.cutOut(doorPolys, [x]));
  /** We keep a reference to uncut walls */
  const uncutWalls = groups.walls;
  groups.walls = Poly.union(unjoinedWalls);
  groups.singles = groups.singles.reduce((agg, single) =>
    agg.concat(single.tags.includes('wall')
      ? Poly.cutOut(doorPolys, [single.poly]).map(poly => ({ ...single, poly }))
      : single
    )
  , /** @type {typeof groups['singles']} */ ([]));

  const symbols = def.items.map(x => lookup[x.symbol]);
  const hullSym = symbols[0];
  const hullOutline = hullSym.hull.map(x => x.clone().removeHoles()); // Not transformed
  const windowPolys = singlesToPolys(groups.singles, 'window');

  // Navigation polygon
  const navPoly = Poly.cutOut(/** @type {Poly[]} */([]).concat(
    // Use non-unioned walls to avoid outset issue
    unjoinedWalls.flatMap(x => x.createOutset(12)),
    groups.obstacles.flatMap(x => x.createOutset(8)),
  ), hullOutline).map(x => x.cleanFinalReps().fixOrientation().precision(4));

  /**
   * - Currently triangle-wasm runs server-side only
   * - Errors thrown by other code seems to trigger error at:
   *   > `/Users/robmyers/coding/rob-myers.github.io/node_modules/triangle-wasm/triangle.out.js:9`
   */
  const navDecomp = triangleService
    ? await triangleService.triangulate(navPoly,
        {
          minAngle: 10,
          // maxArea: 10000,
          // maxSteiner: 300,
        }
      )
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

  const allWalls = Poly.union(hullSym.hull.concat(uncutWalls, windowPolys));
  const holes = allWalls.flatMap(x => x.holes.map(ring => new Poly(ring)));

  const doors = groups.singles.filter(x => x.tags.includes('door'))
    .map((x) => singleToConnectorRect(x, holes)
  );
  const windows = groups.singles.filter(x => x.tags.includes('window'))
    .map((x) => singleToConnectorRect(x, holes)
  );

  /**
   * Compute navZone using method from three-pathfinding.
   * In browser we'll use it to create a FloorGraph.
   * We expect it to have exactly one group.
   */
  const navZone = buildZoneWithMeta(navDecomp);

  // Attach metadata to navZone
  const navNodes = navZone.groups[0];
  const tempTri = new Poly;
  doors.forEach(({ seg: [u, v] }, doorId) => {
    navNodes.forEach((node, nodeId) => {
      tempTri.outline = node.vertexIds.map(vid => navZone.vertices[vid])
      if (geom.lineSegIntersectsPolygon(u, v, tempTri)) {
        // console.log({ doorId, nodeId });
        (navZone.doorNodeIds[doorId] = navZone.doorNodeIds[doorId] || []).push(nodeId);
      }
    })
  });

  const roomGraphJson = RoomGraph.json(holes, doors, windows);
  const roomGraph = RoomGraph.from(roomGraphJson);

  return {
    key: def.key,
    id: def.id,
    def,
    groups,

    holes,
    doors,
    windows,
    labels,
    navPoly,
    navZone,
    roomGraph,
    
    hullPoly: hullSym.hull.map(x => x.clone()),
    hullTop: Poly.cutOut(doorPolys.concat(windowPolys), hullSym.hull),
    hullRect: Rect.from(...hullSym.hull.concat(doorPolys).map(x => x.rect)),

    items: symbols.map(/** @returns {Geomorph.ParsedLayout['items'][0]} */  (sym, i) => ({
      key: sym.key,
      pngHref: i ? `/symbol/${sym.key}.png` : `/debug/${def.key}.png`,
      pngRect: sym.pngRect,
      transformArray: def.items[i].transform,
      transform: def.items[i].transform ? `matrix(${def.items[i].transform})` : undefined,
    })),
  };
}

/**
 * @param {Geomorph.SvgGroupsSingle<Geom.Poly>} single 
 * @param {Geom.Poly[]} holes 
 * @returns {Geomorph.ParsedConnectorRect}
 */
function singleToConnectorRect(single, holes) {
  const { poly, tags } = single;
  const { angle, rect } = geom.polyToAngledRect(poly);
  const [u, v] = geom.getAngledRectSeg({ angle, rect });
  const normal = v.clone().sub(u).rotate(Math.PI / 2).normalize();

  const infront = poly.center.addScaledVector(normal, 10);
  const behind = poly.center.addScaledVector(normal, -10);
  /** @type {[null | number, null | number]} */
  const connectorHoleIds = holes.reduce((agg, hole, holeId) => {
    if (agg[0] === null && hole.contains(infront)) return [holeId, agg[1]];
    if (agg[1] === null && hole.contains(behind)) return [agg[0], holeId];
    return agg;
  }, /** @type {[null | number, null | number]} */ ([null, null]));

  return {
    angle,
    rect: rect.precision(3),
    poly,
    tags,
    seg: [u.precision(3), v.precision(3)],
    normal: normal.precision(3),
    holeIds: connectorHoleIds,
  };
}

/**
 * @param {Geomorph.ConnectorRectJson} x
 * @returns {Geomorph.ParsedConnectorRect}
 */
function parseConnectRect(x) {
  return {
    ...x,
    normal: Vect.from(x.normal),
    poly: Poly.from(x.poly),
    rect: Rect.fromJson(x.rect),
    seg: [Vect.from(x.seg[0]), Vect.from(x.seg[1])],
  }
}

/** @param {Geomorph.ParsedLayout} layout */
export function serializeLayout({
  def, groups,
  holes: allHoles, doors, windows, labels, navPoly, navZone, roomGraph,
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

    holes: allHoles.map(x => x.geoJson),
    doors: doors.map((x) => ({ ...x, poly: x.poly.geoJson })),
    windows: windows.map((x) => ({ ...x, poly: x.poly.geoJson })),
    labels,
    navPoly: navPoly.map(x => x.geoJson),
    navZone,
    roomGraph: roomGraph.plainJson(),

    hullPoly: hullPoly.map(x => x.geoJson),
    hullRect,
    hullTop: hullTop.map(x => x.geoJson),

    items,
  };
  return json;
}

/** @param {Geomorph.LayoutJson} layout */
export function parseLayout({
  def, groups,
  holes: allHoles, doors, windows, labels, navPoly, navZone, roomGraph,
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

    holes: allHoles.map(Poly.from),
    doors: doors.map(parseConnectRect),
    windows: windows.map(parseConnectRect),
    labels,
    navPoly: navPoly.map(Poly.from),
    navZone,
    roomGraph: RoomGraph.from(roomGraph),

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

  const singles = extractGeomsAt($, topNodes, 'singles');
  const hull = extractGeomsAt($, topNodes, 'hull');
  const obstacles = extractGeomsAt($, topNodes, 'obstacles');
  const walls = extractGeomsAt($, topNodes, 'walls');

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

/** @param {Poly[]} polys */
function toJsons(polys) {
  return polys.map(x => x.geoJson);
}

/** @type {Record<Geomorph.LayoutKey, true>} */
const allLayoutKeysLookup = {
  "g-101--multipurpose": true,
  "g-102--research-deck": true,
  "g-301--bridge": true,
  "g-302--xboat-repair-bay": true,
  "g-303--passenger-deck": true,
};

export const allLayoutKeys = keys(allLayoutKeysLookup);

/**
 * - `GeomorphData` extends `ParsedLayout` and comes from `useGeomorph`
 * - `GeomorphDataInstance` extends `GeomorphData`, is relative to `transform` and comes from `useGeomorphs`
 * @param {Geomorph.GeomorphData} gm 
 * @param {[number, number, number, number, number, number]} transform 
 */
export function geomorphDataToGeomorphsItem(gm, transform) {
  const matrix = new Mat(transform);
  const gridRect = (new Rect(0, 0, 1200, gm.pngRect.height > 1000 ? 1200 : 600)).applyMatrix(matrix);

  /** @type {Geomorph.GeomorphDataInstance} */
  const output = {
    ...gm,
    itemKey: `${gm.key}-[${transform}]`,
    transform,
    transformOrigin: `${-gm.pngRect.x}px ${-gm.pngRect.y}px`,
    transformStyle: `matrix(${transform})`,
    matrix,
    inverseMatrix: matrix.getInverseMatrix(),
    gridRect,
  };

  return output;
}

/**
 * @param {Geomorph.ParsedConnectorRect} connector 
 * @param {number} fromHoleId 
 */
export function computeLightPosition(connector, fromHoleId, lightOffset = 40) {
  const roomSign = connector.holeIds[0] === fromHoleId
    ? 1
    : connector.holeIds[1] === fromHoleId ? -1 : null;
  if (roomSign === null) {
    console.warn(`hole ${fromHoleId}: connector: `, connector ,`: roomSign is null`);
  }
  return connector.poly.center.addScaledVector(connector.normal, lightOffset * (roomSign || 0));
}

/**
 * @param {Geom.TriangulationJson} navDecomp
 * @returns {Nav.ZoneWithMeta}
 */
export function buildZoneWithMeta(navDecomp) {
  return {
    ...Builder.buildZone(navDecomp),
    doorNodeIds: [],
  };
}
