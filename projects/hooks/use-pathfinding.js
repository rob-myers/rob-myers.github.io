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
    // pathfinding.setZoneData(zoneKey, zone);

    // Don't FloorGraph.from(json) because
    // FloorGraphJson much larger than Nav.Zone.
    return { graph : FloorGraph.fromZone(zone) };
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
