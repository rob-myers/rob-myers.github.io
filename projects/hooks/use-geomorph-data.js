import { useQuery } from "react-query";
import { geomorphJsonPath, geomorphPngPath } from "../geomorph/geomorph.model";
import { Rect } from "../geom";
import { geom } from "../service/geom";
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
        doors: layout.groups.singles
          .filter(x => x.tags.includes('door'))
          .map(({ poly, tags }) => {
            const { angle, rect } = geom.polyToAngledRect(poly);
            const [u, v] = geom.getAngledRectSeg({ angle, rect });
            return { angle, rect: rect.json, poly: poly.geoJson, tags, seg: [u.json, v.json] };
          }),
        hullOutine: layout.hullPoly[0].removeHoles(),
        pngRect: Rect.fromJson(layout.items[0].pngRect),
      },
    };

    return output;
  }, {
    keepPreviousData: true,
    cacheTime: Infinity,
  });
}
