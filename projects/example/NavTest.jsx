import { css } from "goober";
import { Subject } from "rxjs";

import { equals } from "../service/generic";
import { geomorphPngPath } from "../geomorph/geomorph.model";
import { Vect } from "../geom/vect";
import useMuState from "../hooks/use-mu-state";
import useGeomorphJson from "../hooks/use-geomorph-json";
import * as defaults from "./defaults";
import PanZoom from "../panzoom/PanZoom";
import Doors from "../geomorph/Doors";
import Lights from "../geomorph/Lights";
import AugImage from "../geomorph/AugImage";

/**
 * TODO
 * - new simpler version of <NPCs>
 */

/** @param {{ disabled?: boolean }} props */
export default function NavTest(props) {

  const { data: gm } = useGeomorphJson(layoutKey);

  const state = useMuState(() => {
    /** @type {Geom.LightDef[]} */
    const lightDefs = [
      { key: 'light-def', def: [new Vect(205, 385), 170, 1] },
      { key: 'light-def', def: [new Vect(420, 400), 150, 0.5] },
      { key: 'light-def', def: [new Vect(620, 315), 250, 1] },
    ];
    
    // NOTE Failed to infer type when directly returned (why?)
    const output = {
      lightDefs,
      wire: /** @type {Subject<NPC.NavMessage>} */ (new Subject),
    };
    return output;
  }, {
    lightDefs: (curr, next) => equals(curr, next),
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
          <AugImage
            {...gm.pngRect}
            className="geomorph"
            href={geomorphPngPath(layoutKey)}
            darken={0.85}
          />
          <Lights json={gm} defs={state.lightDefs} wire={state.wire} />
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
