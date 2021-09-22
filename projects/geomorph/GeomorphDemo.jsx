import * as React from "react";
import { css } from "goober";
import { useQuery } from "react-query";
import { Rect } from "../geom";
import { loadImage } from "../service";
import svgJson from 'public/symbol/svg.json';
import { createLayout, deserializeSvgJson, filterSingles } from "./geomorph.model";
import PanZoom from '../panzoom/PanZoom';
import layoutDefs from "./layout-defs";
import { renderGeomorph } from "./geomorph.render";

export default function GeomorphDemo() {
  return (
    <div className={rootCss}>
      <PanZoom initViewBox={initViewBox} gridBounds={gridBounds} maxZoom={6}>
        {/* <Geomorph def={layoutDefs["g-301--bridge"]} /> */}
        <Geomorph def={layoutDefs["g-302--xboat-repair-bay"]} />
        <Geomorph def={layoutDefs["g-301--bridge"]} transform="matrix(1,0,0,1,-1200,0)" />
      </PanZoom>
    </div>
  );
}

/** @param {{ def: Geomorph.LayoutDef; transform?: string }} _ */
function Geomorph({ def, transform }) {
  const { data: gm } = useQuery(`layout-${def.key}`, () => computeLayout(def));
  return gm ? (
    <g transform={transform}>
      {/* <image className="debug" href={gm.pngHref} x={gm.pngRect.x} y={gm.pngRect.y}/> */}
      <image className="geomorph" href={gm.dataUrl} x={gm.pngRect.x * scale} y={gm.pngRect.y * scale} />
      {gm.doors.map((door, i) => <polygon className="door" points={`${door.outline}`} />)}
    </g>
  ) : null;
}

/**
 * @param {Geomorph.LayoutDef} def
 */
async function computeLayout(def) {
  const symbolLookup = deserializeSvgJson(/** @type {*} */ (svgJson));
  const layout = createLayout(def, symbolLookup);
  const canvas = document.createElement('canvas');
  await renderGeomorph(
    layout,
    symbolLookup,
    canvas,
    (pngHref) => loadImage(pngHref),
    { scale, navTris: false },
  );
  return {
    ...layout,
    dataUrl: canvas.toDataURL(),
    pngRect: layout.items[0].pngRect,
    /** Debug only */
    pngHref: layout.items[0].pngHref,
    doors: filterSingles(layout.groups.singles, 'door'),
  };
}

const scale = 4;
const initViewBox = new Rect(0, 0, 1200, 600);
const gridBounds = new Rect(-5000, -5000, 10000 + 1, 10000 + 1);

const rootCss = css`
  height: 100%;
  image.debug {
    opacity: 0.5;
  }
  image.geomorph {
    transform: scale(${1 / scale});
  }
  polygon.door {
    fill: red;
  }
`;