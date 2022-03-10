import { useQuery } from "react-query";
import { geomorphJsonPath } from "../geomorph/geomorph.model";
import { Poly, Rect } from "../geom";
import { parseLayout } from "../service/geomorph";
import { RoomGraph } from "projects/graph/room-graph";

/**
 * @param {Geomorph.LayoutKey} layoutKey 
 */
export default function useGeomorphData(layoutKey) {
  return useQuery(geomorphJsonPath(layoutKey), async () => {
    
    const layout = await fetch(geomorphJsonPath(layoutKey))
      .then(x => x.json())
      .then(parseLayout);

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

    /** @type {Geomorph.GeomorphData} */
    const output = {
      ...layout,
      d: {
        hullOutline: layout.hullPoly[0].removeHoles(),
        pngRect: Rect.fromJson(layout.items[0].pngRect),
        holeCenters: layout.holes.map(({ rect }) => rect.center),
        roomGraph,
        holesWithDoors,
      },
    };

    return output;
  }, {
    keepPreviousData: true,
    cacheTime: Infinity,
  });
}
