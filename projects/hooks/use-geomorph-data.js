import { useQuery } from "react-query";
import { geomorphJsonPath, geomorphPngPath } from "../geomorph/geomorph.model";
import { Rect } from "../geom";
import { parseLayout } from "../service/geomorph";

/**
 * @param {Geomorph.LayoutKey} layoutKey 
 */
export default function useGeomorphData(layoutKey) {
  return useQuery(geomorphJsonPath(layoutKey), async () => {
    
    /** @type {[Geomorph.ParsedLayout, HTMLImageElement]} */
   const [layout, image] = await Promise.all([
      fetch(geomorphJsonPath(layoutKey))
        .then(x => x.json())
        .then(parseLayout),
      new Promise((res, rej) => {
        const image = new Image;
        image.onload = () => res(image);
        image.onerror = rej;
        image.src = geomorphPngPath(layoutKey);
      }),
    ]);

    /** @type {Geomorph.GeomorphData} */
    const output = {
      ...layout,
      // TODO possibly remove, unless HTMLCanvas needed
      image,
      d: {
        hullOutine: layout.hullPoly[0].removeHoles(),
        pngRect: Rect.fromJson(layout.items[0].pngRect),
        holeCenters: layout.allHoles.map(({ rect }) => rect.center),
      },
    };

    return output;
  }, {
    keepPreviousData: true,
    cacheTime: Infinity,
  });
}
