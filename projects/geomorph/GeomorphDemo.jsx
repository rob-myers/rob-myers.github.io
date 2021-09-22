import * as React from "react";
import { css } from "goober";
import { useQuery } from "react-query";
import { Rect, Vect } from "../geom";
import { loadImage } from "../service";
import svgJson from 'public/symbol/svg.json';
import { createLayout, deserializeSvgJson, filterSingles, singlesToPolys } from "./geomorph.model";
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
      <image className="geomorph" href={gm.dataUrl} x={gm.pngRect.x * scale} y={gm.pngRect.y * scale} />

      <g className="doors">
        {gm.doors.map((door) => <polygon points={`${door.outline}`} />)}
      </g>

      <Labels gm={gm} />

      {/* <image className="debug" href={gm.pngHref} x={gm.pngRect.x} y={gm.pngRect.y}/> */}
    </g>
  ) : null;
}

/** @param {{ gm: Geomorph.BrowserLayout }} props */
function Labels({ gm }) {

  /** @param {React.MouseEvent<HTMLElement>} e */
  const onClick = (e) => {
    const div = /** @type {HTMLDivElement} */ (e.target);
    console.log('you clicked', div);
  };

  return (
    <foreignObject className="labels" {...gm.pngRect} xmlns="http://www.w3.org/1999/xhtml">
      <div onClick={onClick}>
        {gm.labels.map(({ center, text, halfDim }) => (
          <div
            className="label"
            style={{ left: center.x - gm.pngRect.x - halfDim.x, top: center.y - gm.pngRect.y - halfDim.y }}
          >
            {text}
          </div>
        ))}
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

  const measurer = /** @type {CanvasRenderingContext2D} */ (document.createElement('canvas').getContext('2d'));
  measurer.font = `${labelSizePx}px sans-serif`;

  return {
    dataUrl: canvas.toDataURL(),
    /** Unscaled */
    pngRect: layout.items[0].pngRect,
    doors: singlesToPolys(layout.groups.singles, 'door'),
    /** Debug only */
    pngHref: layout.items[0].pngHref,

    labels: filterSingles(layout.groups.singles, 'label')
      .map(({ poly, tags }) => {
        const text = tags.filter(x => x !== 'label').join(' ');
        return { center: poly.rect.center, text,
          halfDim: new Vect(4 + measurer.measureText(text).width + 4, 3 + 1 + labelSizePx + 1).scale(0.5),
        };
      }),
  };
}

const scale = 2;
const labelSizePx = 12;
const initViewBox = new Rect(0, 0, 1200, 600);
const gridBounds = new Rect(-5000, -5000, 10000 + 1, 10000 + 1);

const rootCss = css`
  height: 100%;
  g > image.debug {
    opacity: 0.2;
  }
  g > image.geomorph {
    transform: scale(${1 / scale});
    pointer-events: none;
  }
  g > .doors polygon {
    fill: white;
    stroke: black;
  }

  g > .labels {
    font-size: ${labelSizePx}px;
    font-family: sans-serif;
    pointer-events: none;
    div.label {
      background: white;
      position: absolute;
      padding: 1px 4px;
      border-radius: 2px;
      cursor: pointer;
      pointer-events: auto;
      user-select: none; /** TODO better way? */
    }
    circle {
      fill: red;
    }
  }
`;