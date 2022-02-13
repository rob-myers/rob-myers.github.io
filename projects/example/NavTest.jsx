import { css } from "goober";

import * as defaults from "./defaults";
import { geomorphPngPath } from "../geomorph/geomorph.model";
import { Vect } from "../geom/vect";
import useMuState from "../hooks/use-mu-state";
import useGeomorphJson from "../hooks/use-geomorph-json";
import PanZoom from "../panzoom/PanZoom";
import Doors from "../geomorph/Doors";
import Lights from "../geomorph/Lights";

/**
 * TODO
 * - dynamic lighting with door shadows
 * - new simpler version of <NPCs>
 */

/** @param {{ disabled?: boolean }} props */
export default function NavTest(props) {

  const { data: gm } = useGeomorphJson(layoutKey);

  const state = useMuState(() => {
    return {
      lights: [new Vect(205, 385), new Vect(650, 215)],
    };
  }, {
    lights: (curr, next) => curr.every((p, i) => p.equals(next[i])),
  });

  return (
    <PanZoom
      dark
      gridBounds={defaults.gridBounds}
      initViewBox={defaults.initViewBox}
      maxZoom={6}
      className={rootCss}
    >
        {gm && <>
          <image {...gm.pngRect} className="geomorph" href={geomorphPngPath(layoutKey)} />
          <Doors json={gm} />
          <Lights json={gm} positions={state.lights} />
        </>}
    </PanZoom>
  );
}

/** @type {Geomorph.LayoutKey} */
const layoutKey = 'g-301--bridge';

const rootCss = css`
  path.shadow {
    fill: #00000066;
    pointer-events: none;
  }
`;
