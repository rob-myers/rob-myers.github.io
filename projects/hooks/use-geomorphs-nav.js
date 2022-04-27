import React from "react";
import { assertDefined } from "../service/generic";
import usePathfinding from "./use-pathfinding";

// TODO
// - ✅ provide local pathfindings
// - provide api for global pathfinding

/**
 * @param {Graph.GmGraph} g
 * @param {boolean} [disabled]
 * @returns {NPC.UseGeomorphsNav}
 */
export default function useGeomorphsNav(g, disabled) {

  const [gmKeys, setGmKeys] = React.useState(() => g.gms.map(x => x.key));

  React.useMemo(() => {
    // Append unseen keys to layoutKeys i.e. monotonically increases
    const unseenKeys = g.gms.map(x => x.key).filter(x => !gmKeys.includes(x));
    if (unseenKeys.length) {
      setGmKeys([...gmKeys, ...unseenKeys]);
    }
  }, [g]);

  const queries = gmKeys.map(key => {
    // Choose zoneKey to be geomorph key e.g. g-101--multipurpose
    return usePathfinding(key, g.gmData[key], disabled)
  });
  const ready = (
    g.gms.every(x => gmKeys.includes(x.key)) 
    && queries.every(x => x.data)
  );

  return React.useMemo(() => {
    if (ready) {
      const pfs = g.gms.map(gm => {
        const queryIndex = gmKeys.findIndex(y => y === gm.key);
        const data = assertDefined(queries[queryIndex].data)
        return data;
      });
      return {
        pfs,
      };
    } else {
      return {
        pfs: [],
      };
    }
  }, [ready]);

}
