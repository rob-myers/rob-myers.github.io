import { css } from "goober";
import { Poly, Vect } from "projects/geom";
import { ConnectableObservable, Subject } from "rxjs";
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

  const { data: gm } = useGeomorphData(layoutKey);

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

  console.log(gm?.outlines)  

  return (
    <CssPanZoom dark className={rootCss}>
      {gm && <>
        <img
          className="geomorph"
          src={geomorphPngPath(layoutKey)}
          draggable={false}
          style={{
            left: gm.pngRect.x,
            top: gm.pngRect.y,
            width: gm.pngRect.width,
            height: gm.pngRect.height,
          }}
        />

        {/* Area dots */}
        {gm.outlines.slice(1).map((polys, i) =>
          polys.map((poly, j) => {
            const { center } = Poly.from(poly);
            return <div
              key={`${i}:${j}`}
              style={{
                borderRadius: 5,
                border: '5px solid #cc7',
                position: 'absolute',
                cursor: 'pointer',
                left: center.x,
                top: center.y,
              }}
            />
          })
        )}

        {/* <svg
          style={{
            width: gm.pngRect.width,
            height: gm.pngRect.height,
            position: 'absolute',
          }}
        >
          {gm.outlines.slice(1).map((polys, i) =>
            polys.map((poly, j) =>
              <path
                key={`${i}:${j}`}
                fill="rgba(200, 0, 0, 0.4)"
                stroke="blue"
                d={Poly.from(poly).svgPath}
              />
            )
          )}
        </svg> */}

        <img
          className="geomorph-light"
          src={geomorphPngPath(layoutKey)}
          draggable={false}
          style={{
            left: gm.pngRect.x,
            top: gm.pngRect.y,
            width: gm.pngRect.width,
            height: gm.pngRect.height,
            // TEST
            clipPath: `path('${Poly.from(gm.outlines[5][0]).translate(-gm.pngRect.x, -gm.pngRect.y).svgPath}')`,
          }}
        />

        <Doors json={gm} wire={state.wire} />
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
