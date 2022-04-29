import { useQuery } from "react-query";
import { geomorphJsonPath } from "../geomorph/geomorph.model";
import { Poly, Rect } from "../geom";
import { parseLayout } from "../service/geomorph";

/**
 * @param {Geomorph.LayoutKey} layoutKey
 * @param {import('react-query').UseQueryOptions} [useQueryOpts]
 */
export default function useGeomorphData(layoutKey, useQueryOpts) {
  return useQuery(geomorphJsonPath(layoutKey), async () => {
    
    const layout = await fetch(geomorphJsonPath(layoutKey))
      .then(x => x.json()).then(parseLayout);

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

    const switchPoints = layout.groups.singles
      .filter(x => x.tags.includes('switch')).map(x => x.poly.center);

    const spawnPoints = layout.groups.singles
      .filter(x => x.tags.includes('spawn')).map(x => x.poly.center);

    /** @type {Geomorph.GeomorphData} */
    const output = {
      ...layout,
      roomsWithDoors: roomsWithDoors,
      roomsSwitch: layout.rooms.map((poly) => {
        const found = switchPoints.find(p => poly.contains(p));
        return found || poly.rect.center;
      }),
      hullDoors: layout.doors.filter(({ tags }) => tags.includes('hull')),
      hullOutline: layout.hullPoly[0].removeHoles(),
      pngRect: Rect.fromJson(layout.items[0].pngRect),
      spawnPoints,
      lazy: /** @type {*} */ (null),
    };

    output.lazy = createLazyProxy(output);

    return output;
  }, {
    // keepPreviousData: true,
    cacheTime: Infinity,
    .../** @type {*} */ (useQueryOpts),
  });
}

/**
 * Create a proxy for lazy computations
 * @param {Geomorph.GeomorphData} gm
 */
function createLazyProxy(gm) {
  const root = {
    roomNavPoly: /** @type {{ [roomId: number]: Geom.Poly[] }} */ ({}),
  };

  const roomNavPolyProxy = new Proxy({}, {
    get(_, key) {
      if (typeof key !== 'string') return;
      const roomId = Number(key);
      if (gm.roomsWithDoors[roomId] && !root.roomNavPoly[roomId]) {
        root.roomNavPoly[roomId] = Poly.intersect(gm.navPoly, [gm.roomsWithDoors[roomId]]);
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
