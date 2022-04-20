import { useQuery } from "react-query";
import { pathfinding, Pathfinding } from "../pathfinding/Pathfinding";
import { assertDefined } from "../service/generic";

/**
 * @param {string} zoneKey 
 * @param {Nav.Zone | undefined} navZone
 * @param {boolean} [disabled]
 * @returns {import("react-query").UseQueryResult<NPC.PfData>}
 */
export default function usePathfinding(zoneKey, navZone, disabled) {
  return useQuery(zoneKeyToQueryKey(zoneKey), () => {
    const zone = assertDefined(navZone);
    pathfinding.setZoneData(zoneKey, zone);
    return { pathfinding, zone };
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
