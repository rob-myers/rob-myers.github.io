import { css } from "goober";
import { Vect } from "projects/geom";
import { Subject } from "rxjs";
import { geomorphPngPath } from "../geomorph/geomorph.model";
import useGeomorphData from "../hooks/use-geomorph-data";
import useMuState from "../hooks/use-mu-state";
import CssPanZoom from "../panzoom/CssPanZoom";
import { equals } from "../service/generic";
import Doors from "../geomorph/Doors";

/**
 * IDEA provide masks for "light rooms" and layer original image atop
 */

/** @param {{ disabled?: boolean }} props */
export default function GeomorphCssLightsTest(props) {

  const { data: json } = useGeomorphData(layoutKey);

  const state = useMuState(() => {
    /** @type {NPC.LightDef[]} */
    const lightDefs = [
      { key: 'light-def', def: [new Vect(205, 385), 130, 0.7, 0] },
      { key: 'light-def', def: [new Vect(740, 430), 80, 0.6, 0] },
      { key: 'light-def', def: [new Vect(420, 400), 80, 0.8, 1] },
      { key: 'light-def', def: [new Vect(600, 315), 250, 1, 1] },
    ];
    const wire = /** @type {Subject<NPC.NavMessage>} */ (new Subject);
    return { lightDefs, wire }
  }, {
    lightDefs: (curr, next) => equals(curr, next),
  });

  return (
    <CssPanZoom dark className={rootCss}>
      {json && <>
        <img
          className="geomorph"
          src={geomorphPngPath(layoutKey)}
          draggable={false}
          style={{
            left: json.pngRect.x,
            top: json.pngRect.y,
            width: json.pngRect.width,
            height: json.pngRect.height,
            // clipPath: 'inset(40px 20px 30px 40px)',
          }}
        />
        <img
          className="geomorph-light"
          src={geomorphPngPath(layoutKey)}
          draggable={false}
          style={{
            left: json.pngRect.x,
            top: json.pngRect.y,
            width: json.pngRect.width,
            height: json.pngRect.height,
            /**
             * TODO clip some room outlines
             * - precompute them in layout?
             */
            clipPath: 'inset(100px 100px 100px 100px)',
          }}
        />
        {/* <img
          className="geomorph-light"
          src={geomorphPngPath(layoutKey, 'light')}
          draggable={false}
          style={{
            left: json.pngRect.x,
            top: json.pngRect.y,
            width: json.pngRect.width,
            height: json.pngRect.height,
          }}
        /> */}
        <Doors json={json} wire={state.wire} />
      </>}
    </CssPanZoom>
  );
}

/** @type {Geomorph.LayoutKey} */
const layoutKey = 'g-301--bridge';

const rootCss = css`
  img.geomorph {
    filter: invert(100%) brightness(70%);
    position: absolute;
  }
  img.geomorph-light {
    filter: brightness(80%);
    position: absolute;
  }
  canvas {
    position: absolute;
  }
`;
