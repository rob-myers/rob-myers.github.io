import { useQuery } from "react-query";
import { geomorphJsonPath } from "../geomorph/geomorph.model";
import { Poly, Rect } from "../geom";
import { warn } from "../service/log";
import { parseLayout } from "../service/geomorph";
import { geom } from "../service/geom";

/**
 * NOTE saw issue when `geomorphJsonPath(layoutKey)`
 * re-requested, causing doors vs hullDoors mismatch.
 * 
 * @param {Geomorph.LayoutKey} layoutKey
 */
export default function useGeomorphData(layoutKey) {
  return useQuery(geomorphJsonPath(layoutKey), async () => {
    
    const layout = parseLayout(await fetch(geomorphJsonPath(layoutKey)).then(x => x.json()));

    const roomGraph = layout.roomGraph;

    const roomsWithDoors = roomGraph.nodesArray
      .filter(node => node.type === 'room') // Aligned to `rooms`
      .map((node, roomNodeId) => {
        const doors = roomGraph.getEdgesFrom(node)
          .flatMap(({ dst }) =>
            dst.type === 'door' ? layout.doors[dst.doorId].poly : []
          ); // Assume room nodes aligned with rooms
        return Poly.union([layout.rooms[roomNodeId], ...doors])[0];
      });

    const spawnPoints = layout.groups.singles
      .filter(x => x.tags.includes('spawn')).map(x => x.poly.center);

    const switchPoints = layout.groups.singles
      .filter(x => x.tags.includes('switch')).map(x => x.poly.center);

    /**
     * TODO move to json?
     * `light`s override light position
     * Convex polygon `poly` (e.g. rotated rect) should cover door and have center inside room.
     */
    const lightMetas = layout.groups.singles
      .filter(x => x.tags.includes('light'))
      .map(({ poly, tags }) => /** @type {const} */ (
        { center: poly.center, poly, reverse: tags.includes('reverse') }
      ));

    /**
     * `extender`s relate doorIds, and are used to extend the light polygon. 
     */
    const extenderMetas = layout.groups.singles
      .filter(x => x.tags.includes('extender'))
      .flatMap(({ poly }) => {
        const doorIds = layout.doors.flatMap((door, doorId) => geom.convexPolysIntersect(door.poly.outline, poly.outline) ? doorId : []);
        if (doorIds.length >= 2) return [doorIds];
        console.error(`ignoring extender intersecting ≤ 1 doorsIds: ${doorIds}`);
        return [];
      });
    
    // TODO
    // - aggregate into { [doorId: number]: number[] }
    // - computeLightPolygons extends using this
    console.log({extenderMetas})

    /** @type {Geomorph.GeomorphData} */
    const output = {
      ...layout,

      hullDoors: layout.doors.filter(({ tags }) => tags.includes('hull')),
      hullOutline: layout.hullPoly[0].removeHoles(),
      pngRect: Rect.fromJson(layout.items[0].pngRect),
      roomsWithDoors,

      point: {
        all: /** @type {Geom.Vect[]} */ ([]).concat(
          lightMetas.map(x => x.center),
          spawnPoints,
          switchPoints,
        ),

        light: lightMetas.reduce((agg, { center: p, poly, reverse }, i) => {
          let roomId = layout.rooms.findIndex(poly => poly.contains(p));
          const doorId = layout.doors.findIndex((door) => geom.convexPolysIntersect(poly.outline, door.poly.outline));

          if (roomId === -1 || doorId === -1) {
            console.warn(`useGeomorphData: light ${i} has room/doorId ${roomId}/${doorId}`);
          } else if (reverse) {// Reversed light comes from otherRoomId
            const otherRoomId = layout.doors[doorId].roomIds.find(x => x !== roomId);
            if (typeof otherRoomId !== 'number') {
              console.warn(`useGeomorphData: reverse light ${i} lacks other roomId (room/doorId ${roomId}/${doorId})`);
            } else {
              roomId = otherRoomId;
            }
          }// NOTE roomId could be -1
          (agg[roomId] = agg[roomId] || {})[doorId] = p;
          return agg;
        }, /** @type {Record<number, Record<number, Geom.Vect>>} */ ({})),

        spawn: layout.rooms.map((poly) =>
          spawnPoints.filter(p => poly.contains(p))
        ),

        switch: layout.rooms.map((poly) => {
          const found = switchPoints.find(p => poly.contains(p));
          return found || poly.rect.center;
        }),
      },

      lazy: /** @type {*} */ (null),
    };

    output.lazy = createLazyProxy(output);
    extendRoomNodeIds(output);

    return output;
  }, {
    cacheTime: Infinity,
    keepPreviousData: true,
    staleTime: Infinity,
  });
}

/**
 * Create a proxy for lazy computations
 * @param {Geomorph.GeomorphData} gm
 */
function createLazyProxy(gm) {
  const root = {
    roomNavPoly: /** @type {{ [roomId: number]: Geom.Poly }} */ ({}),
  };

  const roomNavPolyProxy = new Proxy({}, {
    get(_, key) {
      if (typeof key !== 'string') return;
      const roomId = Number(key);
      if (gm.roomsWithDoors[roomId] && !root.roomNavPoly[roomId]) {
        // Intersect navPoly with roomWithDoors and take largest disconnected component,
        // i.e. assume smaller polys are unwanted artifacts
        const intersection = Poly.intersect(gm.navPoly, [gm.roomsWithDoors[roomId]]);
        intersection.sort((a, b) => a.rect.area > b.rect.area ? -1 : 1);
        root.roomNavPoly[roomId] = intersection[0];
      }
      return root.roomNavPoly[roomId];
    }
  });

  return new Proxy(root, {
    /** @param {keyof typeof root} key */
    get(_, key) {
      if (key === 'roomNavPoly') {
        return roomNavPolyProxy;
      }
    },
  })
}

/**
 * For each nav node inside a hull doorway,
 * add its id to its respective (unique) room.
 * @param {Geomorph.GeomorphData} gm
 */
function extendRoomNodeIds(gm) {
  // 
  gm.navZone.doorNodeIds.forEach((navNodeIds, doorId) => {
    const door = gm.doors[doorId];
    if (gm.hullDoors.includes(door)) {
      const roomId = /** @type {number} */ (door.roomIds.find(x => x !== null));
      if (Number.isFinite(roomId)) {
        gm.navZone.roomNodeIds[roomId].push(...navNodeIds);
      } else {
        warn(`extendRoomNodeIds: ${gm.key} (hull) door ${doorId} has empty roomIds`);
      }
    }
  });
}
