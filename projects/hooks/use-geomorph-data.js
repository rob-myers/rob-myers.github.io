import { useQuery } from "react-query";
import { geomorphJsonPath } from "../geomorph/geomorph.model";
import { Poly, Rect, Vect } from "../geom";
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
     * TODO move to json?
     * `relate-doors`s relates two doorIds.
     * We'll use it to extend the light polygon.
     */
    const relDoorId = layout.groups.singles
      .filter(x => x.tags.includes('relate-doors'))
      .reduce((agg, { poly }) => {
        const doorIds = layout.doors.flatMap((door, doorId) => geom.convexPolysIntersect(door.poly.outline, poly.outline) ? doorId : []);
        doorIds.forEach(doorId => (agg[doorId] || (agg[doorId] = [])).push(...doorIds.filter(x => x !== doorId)) );
        if (doorIds.length <= 1) console.warn(`poly tagged 'relate-doors' intersects ≤ 1 doorIds: ${doorIds}`);
        return agg;
      },
      /** @type {Record<number, number[]>} */ ({}),
    );
    
    //#region points by room
    /** @type {Geomorph.GeomorphData['point']} */
    const pointsByRoom = layout.rooms.map(x => ({
      default: x.center,
      labels: [],
      light: {},
      spawn: [],
    }));

    lightMetas.forEach(({ center: p, poly, reverse }, i) => {
      let roomId = layout.rooms.findIndex(poly => poly.contains(p));
      const doorId = layout.doors.findIndex((door) => geom.convexPolysIntersect(poly.outline, door.poly.outline));

      if (roomId === -1 || doorId === -1) {
        console.warn(`useGeomorphData: light ${i} has room/doorId ${roomId}/${doorId}`);
      } else if (reverse) {// Reversed light comes from otherRoomId
        const otherRoomId = layout.doors[doorId].roomIds.find(x => x !== roomId);
        if (typeof otherRoomId !== 'number') {
          console.warn(`useGeomorphData: reverse light ${i} lacks other roomId (room/doorId ${roomId}/${doorId})`);
        } else roomId = otherRoomId;
      }// NOTE roomId could be -1

      pointsByRoom[roomId].light[doorId] = p;
    });

    layout.groups.singles.filter(x => x.tags.includes('spawn'))
      .map(x => x.poly.center).forEach((p, i) => {
        const roomId = layout.rooms.findIndex(x => x.contains(p));
        if (roomId >= 0) pointsByRoom[roomId].spawn.push(p);
        else console.warn(`spawn point ${i} should be inside some room`);
      });

    layout.labels.forEach((label) => {
      const roomId = layout.rooms.findIndex(x => x.contains(label.center));
      if (roomId >= 0) {
        pointsByRoom[roomId].labels.push(label);
        pointsByRoom[roomId].default = Vect.from(pointsByRoom[roomId].labels[0].center);
      } else console.warn(`label ${label.text} should be inside some room`);
    });
    //#endregion

    /** @type {Geomorph.GeomorphData} */
    const output = {
      ...layout,

      hullDoors: layout.doors.filter(({ tags }) => tags.includes('hull')),
      hullOutline: layout.hullPoly[0].removeHoles(),
      pngRect: Rect.fromJson(layout.items[0].pngRect),
      roomsWithDoors,
      relDoorId,
      point: pointsByRoom,
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
