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
      .filter(node => node.type === 'room')
      .map((node, roomNodeId) => {
        const doors = roomGraph.getEdgesFrom(node)
          .flatMap(({ dst }) =>
            dst.type === 'door' ? layout.doors[dst.doorIndex].poly : []
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
      roomSwitches: layout.rooms.map((poly) => {
        const found = switchPoints.find(p => poly.contains(p));
        return found || poly.rect.center;
      }),
      hullDoors: layout.doors.filter(({ tags }) => tags.includes('hull')),
      hullOutline: layout.hullPoly[0].removeHoles(),
      pngRect: Rect.fromJson(layout.items[0].pngRect),
      spawnPoints,
    };

    return output;
  }, {
    // keepPreviousData: true,
    cacheTime: Infinity,
    .../** @type {*} */ (useQueryOpts),
  });
}
