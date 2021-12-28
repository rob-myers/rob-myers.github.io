import { useQuery } from "react-query";
import { Poly } from "../geom/poly";
import { geomorphJsonPath } from "../geomorph/geomorph.model";

/**
 * @param {Geomorph.LayoutKey} layoutKey 
 */
export default function useGeomorphJson(layoutKey) {
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

