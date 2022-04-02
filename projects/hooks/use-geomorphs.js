import React from "react";
import { Mat } from "../geom";
import { assertDefined } from "../service/generic";
import { geomorphDataToGeomorphsItem } from "../service/geomorph";
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
      return defs.map(def => {
        const queryIndex = layoutKeys.findIndex(y => y === def.layoutKey);
        const data = assertDefined(queries[queryIndex].data)
        const transform = def.transform || [1, 0, 0, 1, 0, 0];
        return geomorphDataToGeomorphsItem(data, transform);
      });
    } else {
      return [];
    }
  }, [ready]);
}
