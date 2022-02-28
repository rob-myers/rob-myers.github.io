import { css } from "goober";
import { Poly, Vect } from "projects/geom";
import { Subject } from "rxjs";
import { geomorphPngPath } from "../geomorph/geomorph.model";
import useGeomorphData from "../hooks/use-geomorph-data";
import useMuState from "../hooks/use-mu-state";
import CssPanZoom from "../panzoom/CssPanZoom";
import { equals } from "../service/generic";
import Doors from "../geomorph/Doors";
import useUpdate from "projects/hooks/use-update";

/**
 * TODO light switches via meta points in SVGs
 */

/** @param {{ disabled?: boolean }} props */
export default function GeomorphCssLightsTest(props) {

  const { data: gm } = useGeomorphData(layoutKey);
  const update = useUpdate();

  const state = useMuState(() => {
    /** @type {NPC.LightDef[]} */
    const lightDefs = [
      { key: 'light-def', def: [new Vect(205, 385), 130, 0.7, 0] },
      { key: 'light-def', def: [new Vect(740, 430), 80, 0.6, 0] },
      { key: 'light-def', def: [new Vect(420, 400), 80, 0.8, 1] },
      { key: 'light-def', def: [new Vect(600, 315), 250, 1, 1] },
    ];
    return {
      clipPath: 'none',
      lightDefs,
      maskedOutlines: /** @type {{ [outlineIndex: string]: true }} */ ({}),
      wire: /** @type {Subject<NPC.NavMessage>} */ (new Subject),
    };
  }, {
    lightDefs: (curr, next) => equals(curr, next),
  });


  return (
    <CssPanZoom dark className={rootCss}>
      {gm && <>
        <img
          className="geomorph"
          src={geomorphPngPath(layoutKey)}
          draggable={false}
          style={{
            left: gm.d.pngRect.x,
            top: gm.d.pngRect.y,
            width: gm.d.pngRect.width,
            height: gm.d.pngRect.height,
          }}
        />

        {Object.keys(state.maskedOutlines).length ? <img
          className="geomorph-light"
          src={geomorphPngPath(layoutKey)}
          draggable={false}
          style={{
            left: gm.d.pngRect.x,
            top: gm.d.pngRect.y,
            width: gm.d.pngRect.width,
            height: gm.d.pngRect.height,
            clipPath: state.clipPath,
          }}
        /> : null}

        <div // Area dots
          onClick={({ target }) => {
            const dataIndex = Number((/** @type {HTMLElement} */ (target)).getAttribute('data-index'));
            if (dataIndex in state.maskedOutlines) delete state.maskedOutlines[dataIndex];
            else state.maskedOutlines[dataIndex] = true;
            const svgPaths = Object.keys(state.maskedOutlines)
              .map((i) => `${gm.allHoles[Number(i)].clone().translate(-gm.d.pngRect.x, -gm.d.pngRect.y).svgPath}`)
              .join(' ');
            state.clipPath = `path('${svgPaths}')`;
            update();
          }}
          className="area-dots"
        >
          {gm.allHoles.map((poly, i) => {
            const { center } = poly.rect;
            return <div
              key={i}
              data-index={i}
              style={{
                borderRadius: 5,
                border: '5px solid white',
                position: 'absolute',
                cursor: 'pointer',
                left: center.x,
                top: center.y,
              }}
            />
          })}
        </div>

        {/* <svg
          style={{
            width: gm.pngRect.width,
            height: gm.pngRect.height,
            position: 'absolute',
            pointerEvents: 'none',
          }}
        >
          {gm.allHoles.map((poly, i) =>
            <path
              key={i}
              // fill="rgba(0, 0, 200, 0.4)"
              fill="none"
              stroke="blue"
              d={Poly.from(poly).svgPath}
            />
          )}
        </svg> */}

        <Doors gm={gm} wire={state.wire} />
      </>}
    </CssPanZoom>
  );
}

/** @type {Geomorph.LayoutKey} */
const layoutKey = 'g-301--bridge';
// const layoutKey = 'g-101--multipurpose';
// const layoutKey = 'g-302--xboat-repair-bay';

const rootCss = css`
  img.geomorph {
    filter: invert(100%) brightness(60%) contrast(200%) sepia(30%);
    position: absolute;
  }
  img.geomorph-light {
    filter:  brightness(75%);
    position: absolute;
  }
  div.area-dots {
    position: absolute;
  }
  /* canvas {
    position: absolute;
  } */
`;
