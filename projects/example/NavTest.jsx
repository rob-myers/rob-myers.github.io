import { css } from "goober";
import { Subject } from "rxjs";

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
    // NOTE Failed to infer type when directly returned (why?)
    const output = {
      lights: [
        { p: new Vect(205, 385), d: 150 },
        { p: new Vect(620, 315), d: 250 },
      ],
      wire: /** @type {Subject<NPC.NavMessage>} */ (new Subject),
    };
    return output;
  }, {
    lights: (curr, next) => curr.every((({ p, d }, i) =>
      p.equals(next[i].p) && d === next[i].d)
    ),
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
          <image 
            {...gm.pngRect}
            className="geomorph"
            href={geomorphPngPath(layoutKey)}
            style={{
              // Works in safari, but slow!
              filter: 'url(#brightness-test)'
            }}
          />
          <Lights json={gm} lights={state.lights} wire={state.wire} />
          <Doors json={gm} wire={state.wire} />
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
