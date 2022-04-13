import React from "react";
import { assertDefined } from "../service/generic";
import { GmGraph } from "../graph/gm-graph";
import { geomorphDataToGeomorphsItem } from "../service/geomorph";
import useGeomorphData from "./use-geomorph-data";

/**
 * @param {Geomorph.UseGeomorphsDefItem[]} defs 
 */
export default function useGeomorphs(defs) {

  const [layoutKeys, setLayoutKeys] = React.useState(() => defs.map(x => x.layoutKey));

  React.useEffect(() => {
    // Append unseen keys to layoutKeys i.e. monotonically increases
    const unseenKeys = defs.map(x => x.layoutKey).filter(x => !layoutKeys.includes(x));
    if (unseenKeys.length) {
      setLayoutKeys([...layoutKeys, ...unseenKeys]);
    }
  }, [layoutKeys]);

  const queries = layoutKeys.map(layoutKey => useGeomorphData(layoutKey, { staleTime: Infinity }));
  const ready = (
    defs.every(x => layoutKeys.includes(x.layoutKey)) 
    && queries.every(x => x.data)
  );

  /**
   * `output`, `output.gms` and `output.gmGraph` are always the same objects,
   * i.e. we mutate them when data from queries is ready.
   */
  const [output] = React.useState(() => ({
    gms: /** @type {Geomorph.UseGeomorphsItem[]} */ ([]),
    gmGraph: new GmGraph([]),
  }));
  React.useMemo(() => {
    if (ready) {
      const items = defs.map(def => {
        const queryIndex = layoutKeys.findIndex(y => y === def.layoutKey);
        const data = assertDefined(queries[queryIndex].data)
        const transform = def.transform || [1, 0, 0, 1, 0, 0];
        return geomorphDataToGeomorphsItem(data, transform);
      });
      output.gms.length = 0;
      output.gms.push(...items);
      output.gmGraph.reset();
      output.gmGraph.fromGmItems(items);
    }
  }, [ready]);

  return output;
}
