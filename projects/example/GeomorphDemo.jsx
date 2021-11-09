import * as React from "react";
import { css } from "goober";
import { useQuery } from "react-query";
import classNames from "classnames";

import { Rect } from "../geom";
import { loadImage } from "../service/dom";
import { geom } from "../service/geom";
import { labelMeta } from "../geomorph/geomorph.model";
import { createLayout, deserializeSvgJson, singlesToPolys } from "../service/geomorph";
import layoutDefs from "../geomorph/layouts";
import { renderGeomorph } from "../geomorph/geomorph.render";
import svgJson from 'public/symbol/svg.json'; // CodeSandbox?
import PanZoom from '../panzoom/PanZoom';
import { gridBounds, initViewBox } from "./defaults";

const scale = 2;

/**
 * Used to actually build a geomorph step-by-step.
 * We actually compute the layout (as opposed to loading JSON).
 */
export default function GeomorphDemo() {
  return (
    <div className={rootCss}>
      <PanZoom initViewBox={initViewBox} gridBounds={gridBounds} maxZoom={6}>
        <Geomorph def={layoutDefs["g-303--passenger-deck"]} />
        {/* <Geomorph def={layoutDefs["g-101--multipurpose"]} /> */}
        {/* <Geomorph def={layoutDefs["g-301--bridge"]} /> */}
        {/* <Geomorph def={layoutDefs["g-302--xboat-repair-bay"]} /> */}
        {/* <Geomorph def={layoutDefs["g-301--bridge"]} transform="matrix(1,0,0,1,-1200,0)" /> */}
      </PanZoom>
    </div>
  );
}

/** @param {{ def: Geomorph.LayoutDef; transform?: string }} _ */
function Geomorph({ def, transform }) {

  const { data: gm } = useQuery(`layout-${def.key}`, () => computeLayout(def));

  return gm ? (
    <g className={classNames("geomorph", def.key)} transform={transform}>

      <image className="geomorph" href={gm.dataUrl} x={gm.pngRect.x * scale} y={gm.pngRect.y * scale} />

      <ForeignObject gm={gm} />

      <image className="debug" href={gm.pngHref} x={gm.pngRect.x} y={gm.pngRect.y}/>
    </g>
  ) : null;
}

/** @param {{ gm: Geomorph.BrowserLayout }} props */
function ForeignObject({ gm }) {

  /** @param {React.MouseEvent<HTMLElement>} e */
  const onClick = (e) => {
    const div = /** @type {HTMLDivElement} */ (e.target);
    console.log('you clicked', div);
  };

  return (
    <foreignObject {...gm.pngRect} xmlns="http://www.w3.org/1999/xhtml">
      <div onClick={onClick}>
        {gm.labels.map(({ text, padded }) => (
          <div
            className="label"
            style={{
              left: padded.x - gm.pngRect.x,
              top: padded.y - gm.pngRect.y,
            }}
          >
            {text}
          </div>
        ))}
        {gm.doors.map(({ rect, angle }) =>
          <div
            className="door"
            style={{
              left: rect.x - gm.pngRect.x,
              top: rect.y - gm.pngRect.y,
              width: rect.width,
              height: rect.height,
              transformOrigin: 'top left',
              transform: `rotate(${angle}rad)`,
            }} />
        )}
      </div>
  </foreignObject>
  );
}

/**
 * @param {Geomorph.LayoutDef} def
 * @returns {Promise<Geomorph.BrowserLayout>}
 */
async function computeLayout(def) {
  const symbolLookup = deserializeSvgJson(/** @type {*} */ (svgJson));
  const layout = createLayout(def, symbolLookup);
  const canvas = document.createElement('canvas');

  await renderGeomorph(
    layout, symbolLookup, canvas, (pngHref) => loadImage(pngHref),
    { scale, navTris: false },
  );

  return {
    dataUrl: canvas.toDataURL(),
    /** Unscaled */
    pngRect: layout.items[0].pngRect,
    doors: singlesToPolys(layout.groups.singles, 'door')
      .map(poly => geom.polyToAngledRect(poly)),
    /** Debug only */
    pngHref: layout.items[0].pngHref,
    labels: layout.labels,
  };
}

const rootCss = css`
  height: 100%;
  g > image.debug {
    opacity: 0.2;
  }
  g > image.geomorph {
    transform: scale(${1 / scale});
    pointer-events: none;
  }
  g > .doors rect {
    fill: white;
    stroke: black;
  }

  g > foreignObject {
    font: ${labelMeta.font};

    div.label {
      position: absolute;
      padding: ${labelMeta.padY}px ${labelMeta.padX}px;
      
      cursor: pointer;
      pointer-events: auto;
      user-select: none; /** TODO better way? */

      background: black;
      color: white;
    }
    div.door {
      position: absolute;
      cursor: pointer;
      background: white;
      border: 1px solid black;
    }
    circle {
      fill: red;
    }
  }
`;