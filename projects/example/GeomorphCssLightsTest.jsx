import { css } from "goober";
import { Vect } from "projects/geom";
import { Subject } from "rxjs";
import { geomorphPngPath } from "../geomorph/geomorph.model";
import useGeomorphData from "../hooks/use-geomorph-json";
import useMuState from "../hooks/use-mu-state";
import CssPanZoom from "../panzoom/CssPanZoom";
import CanvasLights from "../geomorph/CanvasLights";
import { equals } from "../service/generic";
import Doors from "../geomorph/Doors";

/** @param {{ disabled?: boolean }} props */
export default function GeomorphCssLightsTest(props) {

  const { data: json } = useGeomorphData(layoutKey);

  const state = useMuState(() => {
    /** @type {NPC.LightDef[]} */
    const lightDefs = [
      { key: 'light-def', def: [new Vect(205, 385), 170, 1, 0] },
      { key: 'light-def', def: [new Vect(620, 430), 250, 0.8, 0] },
      { key: 'light-def', def: [new Vect(420, 400), 250, 0.4, 1] },
      { key: 'light-def', def: [new Vect(620, 315), 250, 1, 1] },
    ];
    const wire = /** @type {Subject<NPC.NavMessage>} */ (new Subject);
    return { lightDefs, wire }
  }, {
    lightDefs: (curr, next) => equals(curr, next),
  });

  return (
    <CssPanZoom dark className={rootCss}>
      {json && <>
        {/* <img
          {...json.pngRect}
          src={geomorphPngPath(layoutKey)}
          draggable={false}
        /> */}
        <CanvasLights json={json} defs={state.lightDefs} wire={state.wire} />
        <Doors json={json} wire={state.wire} />
      </>}
    </CssPanZoom>
  );
}

/** @type {Geomorph.LayoutKey} */
const layoutKey = 'g-301--bridge';

const rootCss = css`
  /* img {
    filter: brightness(10%);
  } */
`;
