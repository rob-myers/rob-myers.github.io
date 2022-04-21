import { FloorGraph } from "projects/graph/floor-graph";
import { useQuery } from "react-query";
import { pathfinding } from "../pathfinding/Pathfinding";

/**
 * @param {string} zoneKey 
 * @param {Nav.Zone | undefined} navZone
 * @param {boolean} [disabled]
 * @returns {import("react-query").UseQueryResult<NPC.PfData>}
 */
export default function usePathfinding(zoneKey, navZone, disabled) {
  return useQuery(zoneKeyToQueryKey(zoneKey), () => {
    const zone = /** @type {Nav.Zone} */ (navZone);
    pathfinding.setZoneData(zoneKey, zone);

    // TODO 🚧 move computation to json
    const graph = FloorGraph.fromZone(zone);

    return { graph };
  }, {
    enabled: !!navZone && !disabled,
    keepPreviousData: true,
    staleTime: Infinity,
  });
}

/** @param {string} zoneKey */
function zoneKeyToQueryKey(zoneKey) {
  return `pathfinding-${zoneKey}`;
}
