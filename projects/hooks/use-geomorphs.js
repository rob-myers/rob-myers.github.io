import React from "react";
import { assertDefined } from "../service/generic";
import { gmGraphClass } from "../graph/gm-graph";
import { geomorphDataToInstance } from "../service/geomorph";
import useGeomorphData from "./use-geomorph-data";

/**
 * @param {Geomorph.UseGeomorphsDefItem[]} defs 
 */
export default function useGeomorphs(defs) {

  const [gmKeys, setLayoutKeys] = React.useState(() => defs.map(x => x.layoutKey));

  React.useMemo(() => {
    // Append unseen keys to layoutKeys i.e. monotonically increases
    const unseenKeys = defs.map(x => x.layoutKey).filter(x => !gmKeys.includes(x));
    if (unseenKeys.length) {
      setLayoutKeys([...gmKeys, ...unseenKeys]);
    }
  }, [defs]);

  const queries = gmKeys.map(layoutKey => useGeomorphData(layoutKey));
  const ready = (
    defs.every(x => gmKeys.includes(x.layoutKey)) 
    && queries.every(x => x.data)
  );

  return React.useMemo(() => {
    if (ready) {
      const items = defs.map(def => {
        const queryIndex = gmKeys.findIndex(y => y === def.layoutKey);
        const data = assertDefined(queries[queryIndex].data)
        const transform = def.transform || [1, 0, 0, 1, 0, 0];
        return geomorphDataToInstance(data, transform);
      });
      return { gms: items, gmGraph: gmGraphClass.fromGms(items) };
    } else {
      return { gms: [], gmGraph: new gmGraphClass([]) }
    }
  }, [ready, ...queries.map(x => x.data)]);
}
