import { useQuery } from "react-query";
import { Poly } from "../geom/poly";
import { geomorphJsonPath, geomorphPngPath } from "../geomorph/geomorph.model";

/**
 * @param {Geomorph.LayoutKey} layoutKey 
 */
export default function useGeomorphData(layoutKey) {
  return useQuery(geomorphJsonPath(layoutKey), async () => {
    
    /** @type {[Geomorph.GeomorphJson, HTMLImageElement]} */
   const [json, image] = await Promise.all([
      fetch(geomorphJsonPath(layoutKey))
        .then(x => x.json()),
      new Promise((res, rej) => {
        const image = new Image;
        image.onload = () => res(image);
        image.onerror = rej;
        image.src = geomorphPngPath(layoutKey);
      }),
    ]);

    /** @type {Geomorph.GeomorphData} */
    const output = {
      ...json,
      // TODO possibly remove, unless HTMLCanvas needed
      image,
      /** Derived computations */
      d: {
        navPoly: json.navPoly.map(Poly.from),
        hullOutine: Poly.from(json.hullPoly[0]).removeHoles(),
      },
    };

    return output;
  }, {
    keepPreviousData: true,
    cacheTime: Infinity,
  });
}
