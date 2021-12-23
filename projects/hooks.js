import { useQuery } from "react-query";
import { Poly } from "./geom/poly";
import { geomorphJsonPath } from "./geomorph/geomorph.model";
import { pathfinding, Pathfinding } from "./pathfinding/Pathfinding";
import { assertDefined } from "./service/generic";

/**
 * @param {Geomorph.LayoutKey} layoutKey 
 */
export function useGeomorphJson(layoutKey) {
  return useQuery(geomorphJsonPath(layoutKey), async () => {
    /** @type {Geomorph.GeomorphJson} */
    const json = (await (fetch(geomorphJsonPath(layoutKey)).then(x => x.json())));
    return {
      ...json,
      /** Derived computations */
      d: {
        navPoly: json.navPoly.map(Poly.from),
      },
    };
  }, {
    keepPreviousData: true,
  });
}

/**
 * @param {string} zoneKey 
 * @param {Geom.TriangulationJson | undefined} decomp
 * @param {boolean} [disabled]
 * @returns {import("react-query").UseQueryResult<PfData>}
 */
export function usePathfinding(zoneKey, decomp, disabled) {
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

/**
 * @typedef PfData @type {object}
 * @property {Pathfinding} pathfinding
 * @property {Nav.Zone} zone
 */
