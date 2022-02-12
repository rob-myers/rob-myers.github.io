import * as defaults from "./defaults";
import useMuState from "../hooks/use-mu-state";
import useGeomorphJson from "../hooks/use-geomorph-json";
import PanZoom from "../panzoom/PanZoom";
import { geomorphPngPath } from "projects/geomorph/geomorph.model";
import { Doors } from "projects/geomorph/Doors";

/**
 * TODO
 * - dynamic lighting with door shadows
 * - new simpler version of <NPCs>
 */

/** @param {{ disabled?: boolean }} props */
export default function NavTest(props) {

  const { data: gm } = useGeomorphJson(layoutKey);

  useMuState(() => {
    return {

    };
  });

  return (
    <PanZoom
      dark
      gridBounds={defaults.gridBounds}
      initViewBox={defaults.initViewBox}
      maxZoom={6}
    >
        {gm && <>
          <image {...gm.pngRect} className="geomorph" href={geomorphPngPath(layoutKey)} />
          <Doors json={gm} />
        </>}

    </PanZoom>
  );
}

/** @type {Geomorph.LayoutKey} */
const layoutKey = 'g-301--bridge';
