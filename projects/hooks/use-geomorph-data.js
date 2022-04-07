import { useQuery } from "react-query";
import { geomorphJsonPath } from "../geomorph/geomorph.model";
import { Poly, Rect } from "../geom";
import { parseLayout } from "../service/geomorph";
import { RoomGraph } from "projects/graph/room-graph";

/**
 * @param {Geomorph.LayoutKey} layoutKey
 * @param {import('react-query').UseQueryOptions} [useQueryOpts]
 */
export default function useGeomorphData(layoutKey, useQueryOpts) {
  return useQuery(geomorphJsonPath(layoutKey), async () => {
    
    const layout = await fetch(geomorphJsonPath(layoutKey))
      .then(x => x.json()).then(parseLayout);

    const roomGraph = RoomGraph.fromJson(layout.roomGraph);
    const holesWithDoors = roomGraph.nodesArray
      .filter(node => node.type === 'room')
      .map((node, holeIndex) => {
        const doors = roomGraph.getEdgesFrom(node)
          .flatMap(({ dst }) =>
            dst.type === 'door' ? layout.doors[dst.doorIndex].poly : []
          ); // Assume nodes aligned with holes...
        return Poly.union([layout.holes[holeIndex], ...doors])[0];
      });

    const switchPoints = layout.groups.singles
      .filter(x => x.tags.includes('switch')).map(x => x.poly.center);

    const spawnPoints = layout.groups.singles
      .filter(x => x.tags.includes('spawn')).map(x => x.poly.center);

    /** @type {Geomorph.GeomorphData} */
    const output = {
      ...layout,
      d: {
        holesWithDoors,
        holeSwitches: layout.holes.map((poly) => {
          const found = switchPoints.find(p => poly.contains(p));
          return found || poly.rect.center;
        }),
        hullDoors: layout.doors.filter(({ tags }) => tags.includes('hull')),
        hullOutline: layout.hullPoly[0].removeHoles(),
        pngRect: Rect.fromJson(layout.items[0].pngRect),
        roomGraph,
        spawnPoints,
      },
    };

    return output;
  }, {
    // keepPreviousData: true,
    cacheTime: Infinity,
    .../** @type {*} */ (useQueryOpts),
  });
}
