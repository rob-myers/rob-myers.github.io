import React from "react";
import { Mat } from "../geom";
import useGeomorphData from "./use-geomorph-data";

/**
 * TODO
 * - maintain monotonically increasing array of items
 */

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
  const ready = queries.every(Boolean);

  return React.useMemo(() => {
    if (ready) {
      const matrix = new Mat;
      return defs.map(def => {
        const queryIndex = layoutKeys.findIndex(y => y === def.layoutKey);
        const { data } = queries[queryIndex];
        def.transform ? matrix.feedFromArray(def.transform) : matrix.setIdentity();
        return {
          pngRect: data?.d.pngRect.applyMatrix(matrix),
          // TODO
        };
      });
    } else {
      return [];
    }
  }, [ready]);
}
