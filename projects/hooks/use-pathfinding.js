import { useQuery } from "react-query";
import { pathfinding, Pathfinding } from "../pathfinding/Pathfinding";
import { assertDefined } from "../service/generic";

/**
 * @param {string} zoneKey 
 * @param {Geom.TriangulationJson | undefined} decomp
 * @param {boolean} [disabled]
 * @returns {import("react-query").UseQueryResult<NPC.PfData>}
 */
export default function usePathfinding(zoneKey, decomp, disabled) {
  return useQuery(`pathfinding-${zoneKey}`, () => {
    const zone = Pathfinding.createZone(assertDefined(decomp));
    pathfinding.setZoneData(zoneKey, zone);
    return { pathfinding, zone };
  }, {
    enabled: !!decomp && !disabled,
    keepPreviousData: true,
    staleTime: Infinity,
  });
}
