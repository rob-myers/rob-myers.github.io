import cheerio, { CheerioAPI, Element } from 'cheerio';
import { createCanvas } from 'canvas';
import { Poly, Rect, Mat, Vect } from '../geom';
import { extractGeomsAt, hasTitle } from './cheerio';
import { geom } from './geom';
import { filterSingles, labelMeta, singlesToPolys } from '../geomorph/geomorph.model';
import { RoomGraph } from '../graph/room-graph';
import { Builder } from '../pathfinding/Builder';
import { error, warn } from './log';

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

  // Rooms (induced by all walls)
  const allWalls = Poly.union(hullSym.hull.concat(uncutWalls, windowPolys));
  allWalls.sort((a, b) => a.rect.area > b.rect.area ? -1 : 1); // Descending by area
  const rooms = allWalls[0].holes.map(ring => new Poly(ring));
  // Finally, internal pillars are converted into holes inside room
  allWalls.slice(1).forEach(pillar => {
    const witness = pillar.outline[0];
    const room = rooms.find(x => x.contains(witness));
    if (room) {// We ignore any holes in pillar
      room.holes.push(pillar.outline);
    } else {
      warn(`${def.key}: pillar ${JSON.stringify(pillar.rect.json)} does not reside in any room`);
    }
  });

  const doors = groups.singles.filter(x => x.tags.includes('door'))
    .map((x) => singleToConnectorRect(x, rooms)
  );
  const windows = groups.singles.filter(x => x.tags.includes('window'))
    .map((x) => singleToConnectorRect(x, rooms)
  );

  const hullRect = Rect.from(...hullSym.hull.concat(doorPolys).map(x => x.rect));
  doors.filter(x => x.tags.includes('hull')).forEach(door => {
    extendHullDoorTags(door, hullRect);
  });

  /** Sometimes large disjoint nav areas must be discarded  */
  const ignoreNavPoints = groups.singles
    .filter(x => x.tags.includes('ignore-nav')).map(x => x.poly.center);

  /**
   * Navigation polygon obtained by cutting walls and obstacles
   * from `hullOutline`, thereby creating doorways (including doors).
   * We also discard polygons which intersect ignoreNavPoints.
   */
  const navPolyWithDoors = Poly.cutOut(/** @type {Poly[]} */([]).concat(
    // Use non-unioned walls to avoid outset issue
    unjoinedWalls.flatMap(x => x.createOutset(12)),
    groups.obstacles.flatMap(x => x.createOutset(8)),
  ), hullOutline).map(
    x => x.cleanFinalReps().fixOrientation().precision(4)
  ).filter(poly => 
    !ignoreNavPoints.some(p => poly.contains(p))
    && poly.rect.area > 20 * 20 // also ignore small areas
  );

  /** Intersection of each door (angled rect) with navPoly */
  const navDoorPolys = doorPolys
    .flatMap(doorPoly => Poly.intersect([doorPoly], navPolyWithDoors))
    .map(x => x.cleanFinalReps());
  /** Navigation polygon without doors */
  const navPolySansDoors = Poly.cutOut(doorPolys, navPolyWithDoors);

  /**
   * Apply Triangle triangulation library to `navPolySansDoors`.
   * - We add the doors back manually further below
   * - Currently triangle-wasm runs server-side only
   * - Errors thrown by other code seems to trigger error at:
   *   > `{REPO_ROOT}/node_modules/triangle-wasm/triangle.out.js:9`
   */
  const navDecomp = triangleService
    ? await triangleService.triangulate(
        navPolySansDoors,
        {
          // minAngle: 10,
          // maxSteiner: 100,
          // maxArea: 750,
        },
      )
    : { vs: [], tris: [] };

  /**
   * Extend navDecomp with 2 triangles for each door
   * - We assume well-formedness i.e. exactly 2 edges already present
   *   in the triangulation. If not we warn and skip the door.
   */
  const tempVect = new Vect;
  // const tempPoly = new Poly([new Vect, new Vect, new Vect]);
  for (const [i, { outline }] of navDoorPolys.entries()) {
    if (outline.length !== 4) {
      error(`door ${i} nav skipped: expected 4 vertices but saw ${outline.length}`);
      continue;
    }
    // 1st triangle arises from any three ids
    const ids = outline.map(p => {
      const vId = navDecomp.vs.findIndex(q => p.equalsAlmost(q, 0.0001));
      return vId === -1 ? navDecomp.vs.push(p) - 1 : vId;
    });
    const triA = /** @type {[number, number, number]} */ (ids.slice(0, 3));

    // 2nd triangle follows via distance
    tempVect.copy(navDecomp.vs[ids[3]]);
    const idDists = triA.map(id => [id, tempVect.distanceTo(navDecomp.vs[id])])
      .sort((a, b) => a[1] < b[1] ? -1 : 1);
    const triB = /** @type {[number, number, number]} */ (
      [ids[3]].concat(idDists.slice(0, 2).map(x => x[0]))
    );
    // triA.forEach((id, j) => tempPoly.outline[j].copy(navDecomp.vs[id]));
    // if (tempPoly.anticlockwise()) triA.reverse();
    // triB.forEach((id, j) => tempPoly.outline[j].copy(navDecomp.vs[id]));
    // if (tempPoly.anticlockwise()) triB.reverse();
    // console.log(ids.length, { ids, triA, triB });
    navDecomp.tris.push(triA, triB);
  }

  console.log('nav tris count:', navDecomp.vs.length)

  /**
   * Compute navZone using method from three-pathfinding,
   * also attaching `doorNodeIds` and `roomNodeIds`.
   * In the browser we'll use it to create a `FloorGraph`.
   * We expect it to have exactly one group.
   */
  const navZone = buildZoneWithMeta(navDecomp, doors, rooms);
  navZone.groups.forEach((tris, i) =>
    i > 0 && tris.length <= 12 && warn(`createLayout: unexpected small navZone group ${i} with ${tris.length} tris`)
  );

  const roomGraphJson = RoomGraph.json(rooms, doors, windows);
  const roomGraph = RoomGraph.from(roomGraphJson);

  return {
    key: def.key,
    id: def.id,
    def,
    groups,

    rooms,
    doors,
    windows,
    labels,
    // navPoly: navPolySansDoors,
    navPoly: navPolyWithDoors,
    navZone,
    roomGraph,
    
    hullPoly: hullSym.hull.map(x => x.clone()),
    hullTop: Poly.cutOut(doorPolys.concat(windowPolys), hullSym.hull),
    hullRect,

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
 * @param {Geomorph.ParsedConnectorRect} door 
 * @param {Geom.Rect} hullRect 
 */
 function extendHullDoorTags(door, hullRect) {
  const bounds = door.poly.rect;
  if (bounds.y === hullRect.y) door.tags.push('hull-n');
  else if (bounds.right === hullRect.right) door.tags.push('hull-e');
  else if (bounds.bottom === hullRect.bottom) door.tags.push('hull-s');
  else if (bounds.x === hullRect.x) door.tags.push('hull-w');
}

/**
 * @param {Geomorph.SvgGroupsSingle<Geom.Poly>} single 
 * @param {Geom.Poly[]} rooms 
 * @returns {Geomorph.ParsedConnectorRect}
 */
function singleToConnectorRect(single, rooms) {
  const { poly, tags } = single;
  const { angle, baseRect } = poly.outline.length === 4
    ? geom.polyToAngledRect(poly)
    // For curved windows we simply use aabb
    : { baseRect: poly.rect, angle: 0 };
  const [u, v] = geom.getAngledRectSeg({ angle, baseRect });
  const normal = v.clone().sub(u).rotate(Math.PI / 2).normalize();

  const doorEntryDelta = (Math.min(baseRect.width, baseRect.height)/2) + 0.05
  const infront = poly.center.addScaledVector(normal, doorEntryDelta).precision(3);
  const behind = poly.center.addScaledVector(normal, -doorEntryDelta).precision(3);

  /** @type {[null | number, null | number]} */
  const roomIds = rooms.reduce((agg, room, roomId) => {
    if (agg[0] === null && room.contains(infront)) return [roomId, agg[1]];
    if (agg[1] === null && room.contains(behind)) return [agg[0], roomId];
    return agg;
  }, /** @type {[null | number, null | number]} */ ([null, null]));

  return {
    angle,
    baseRect: baseRect.precision(3),
    poly,
    rect: poly.rect,
    tags,
    seg: [u.precision(3), v.precision(3)],
    normal: normal.precision(3),
    roomIds: roomIds,
    entries: [infront, behind],
  };
}


/**
 * @param {Geomorph.ConnectorRectJson} x
 * @returns {Geomorph.ParsedConnectorRect}
 */
function parseConnectRect(x) {
  const poly = Poly.from(x.poly);
  return {
    ...x,
    baseRect: Rect.fromJson(x.baseRect),
    poly: poly,
    rect: poly.rect,
    normal: Vect.from(x.normal),
    seg: [Vect.from(x.seg[0]), Vect.from(x.seg[1])],
    entries: [
      Vect.from(x.entries[0]),
      Vect.from(x.entries[1]),
    ],
  }
}

/** @param {Geomorph.ParsedLayout} layout */
export function serializeLayout({
  def, groups,
  rooms, doors, windows, labels, navPoly, navZone, roomGraph,
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

    rooms: rooms.map(x => x.geoJson),
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
  rooms, doors, windows, labels, navPoly, navZone, roomGraph,
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

    rooms: rooms.map(Poly.from),
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

/**
 * - `GeomorphData` extends `ParsedLayout` and comes from `useGeomorph`
 * - `GeomorphDataInstance` extends `GeomorphData`, is relative to `transform` and comes from `useGeomorphs`
 * @param {Geomorph.GeomorphData} gm 
 * @param {[number, number, number, number, number, number]} transform 
 */
export function geomorphDataToInstance(gm, transform) {
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
 * Lockers in bridge--042--8x9 need ~20.
 * @param {Geomorph.ParsedConnectorRect} connector 
 * @param {number} srcRoomId 
 * @param {number} lightOffset In direction from srcRoomId through connector 
 */
export function computeLightPosition(connector, srcRoomId, lightOffset) {
  const roomSign = connector.roomIds[0] === srcRoomId
    ? 1 : connector.roomIds[1] === srcRoomId ? -1 : null;
  if (roomSign === null) {
    console.warn(`room ${srcRoomId}: connector: `, connector ,`: roomSign is null`);
  }
  return connector.poly.center.addScaledVector(connector.normal, lightOffset * (roomSign || 0));
}

/**
 * @param {Geom.TriangulationJson} navDecomp
 * @param {Geomorph.ParsedConnectorRect[]} doors
 * @param {Geom.Poly[]} rooms
 * @returns {Nav.ZoneWithMeta}
 */
export function buildZoneWithMeta(navDecomp, doors, rooms) {
  const navZone = Builder.buildZone(navDecomp);
  /**
   * - Multiple navZone groups are possible e.g. 102. 
   * - If invoked browser-side, no triangulation hence no navNodes
   */
  const navNodes = navZone.groups.flatMap(x => x) || [];

  /**
   * We'll verify that:
   * (a) every nav node has either a doorId or a roomId.
   * (b) every nav node has at most one doorId.
   * (c) every doorId is related to exactly two nav nodes.
   * (d) every nav node without a doorId has at most one roomId.
   *
   * There may be overlap i.e. the two triangles corresponding
   * to a particular doorId may overlap the rooms they connect.
   */
  const nodeDoorIds = /** @type {number[][]} */ ([]);
  const nodeRoomIds = /** @type {number[][]} */ ([]);

  /**
   * Attach `doorNodeIds` to navZone.
   * A nav node is associated with at most one doorId,
   * when it intersects the respective door's line segment.
   */
  const doorNodeIds = /** @type {number[][]} */ ([]);
  const tempTri = new Poly;
  doors.forEach(({ seg: [u, v] }, doorId) => {
    doorNodeIds[doorId] = [];
    navNodes.forEach((node, nodeId) => {
      tempTri.outline = node.vertexIds.map(vid => navZone.vertices[vid]);
      if (geom.lineSegIntersectsPolygon(u, v, tempTri)) {
        doorNodeIds[doorId].push(nodeId);
        if ((nodeDoorIds[nodeId] = nodeDoorIds[nodeId] || []).push(doorId) > 1) {
          warn('nav node', node, 'has multiple doorIds', nodeDoorIds[nodeId]);
        }
      }
    });
  });

  const malformedDoorIds = doorNodeIds.flatMap((x, i) => x.length === 2 ? [] : i);
  if (malformedDoorIds.length) {
    warn('doorIds lacking exactly 2 nav nodes:', malformedDoorIds, `(resp. counts ${malformedDoorIds.map(i => doorNodeIds[i].length)})`);
  }

  /**
   * Attach `roomNodeIds` to navZone.
   * A nav node is associated with at most one roomId i.e.
   * when some vertex lie inside the room.
   */
  const roomNodeIds = /** @type {number[][]} */ ([]);
  rooms.forEach((poly, roomId) => {
    roomNodeIds[roomId] = [];
    navNodes.forEach((node, nodeId) => {
      // if (node.vertexIds.filter(id => poly.outlineContains(navZone.vertices[id])).length >= 2) {
      if (node.vertexIds.some(id => poly.outlineContains(navZone.vertices[id]))) {
        roomNodeIds[roomId].push(nodeId);
        if (
          (nodeRoomIds[nodeId] = nodeRoomIds[nodeId] || []).push(roomId) > 1
          && nodeDoorIds[nodeId].length === 0 // nodes with a doorId may have 2 roomIds
        ) {
          warn('nav node', node.id, 'has no doorId and multiple roomIds', nodeRoomIds[nodeId]);
        }
      }
    });
  });
  
  const nodesSansBothIds = nodeRoomIds.flatMap((roomIds, nodeId) => roomIds.length ? [] : nodeDoorIds[nodeId].length ? [] : nodeId);
  if (nodesSansBothIds.length) {
    warn('nav nodes have neither roomId nor doorId', nodesSansBothIds);
  }

  return {
    ...navZone,
    doorNodeIds,
    roomNodeIds,
  };
}
