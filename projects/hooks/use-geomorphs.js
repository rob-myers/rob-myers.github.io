import React from "react";
import { Mat } from "../geom";
import { assertDefined } from "../service/generic";
import useGeomorphData from "./use-geomorph-data";

/**
 * @param {Geomorph.UseGeomorphsDefItem[]} defs 
 */
export default function useGeomorphs(defs) {

  const [layoutKeys, setLayoutKeys] = React.useState(() => defs.map(x => x.layoutKey));

  React.useEffect(() => {
    const unseenKeys = defs.map(x => x.layoutKey).filter(x => !layoutKeys.includes(x));
    setLayoutKeys([...layoutKeys, ...unseenKeys]);
  }, [layoutKeys]);

  const queries = layoutKeys.map(layoutKey => useGeomorphData(layoutKey, { staleTime: Infinity }));
  const ready = queries.every(x => x.data) && defs.every(x => layoutKeys.includes(x.layoutKey));

  return React.useMemo(() => {
    if (ready) {
      const matrix = new Mat;
      return defs.map(def => {
        const queryIndex = layoutKeys.findIndex(y => y === def.layoutKey);
        const data = assertDefined(queries[queryIndex].data)
        def.transform ? matrix.feedFromArray(def.transform) : matrix.setIdentity();

        const pngRect = data.d.pngRect.clone().applyMatrix(matrix);

        const transform = def.transform || [1, 0, 0, 1, 0, 0];
        const { a, b, c, d, e, f } = new DOMMatrix(transform).inverse();

        /** @type {Geomorph.UseGeomorphsItem} */
        const output = {
          layoutKey: def.layoutKey,
          transform,
          inverseTransform: [a, b, c, d, e, f],
          transformStyle: `matrix(${transform})`,
          pngRect,
          roomGraph: data.d.roomGraph, // No need to clone or transform
          holesWithDoors: data.d.holesWithDoors.map(x => x.clone().applyMatrix(matrix)),
          hullOutline: data.d.hullOutline.clone().applyMatrix(matrix),
          doors: data.doors.map((meta) => ({
            ...meta, poly: meta.poly.clone().applyMatrix(matrix),
          })),
        };
        return output;
      });
    } else {
      return [];
    }
  }, [ready]);
}
