import * as React from "react";
import { css } from "goober";
import { useQuery } from "react-query";
import { Rect } from "../geom";
import PanZoom from '../panzoom/PanZoom';
import { createLayout, deserializeSvgJson } from "./geomorph.model";
import svgJson from 'public/symbol/svg.json';
import layoutDefs from "./layout-defs";
import { renderAuxCanvases } from "./geomorph.render";

export default function GeomorphDemo() {
  useQuery('focus-trigger', () => {}); // TODO dev only
  return (
    <div className={rootCss}>
      <PanZoom initViewBox={initViewBox} gridBounds={gridBounds} maxZoom={6}>
        {/* <Geomorph def={layoutDefs["g-301--bridge"]} transform="matrix(1,0,0,1,-1200,0)" /> */}
        <Geomorph def={layoutDefs["g-302--xboat-repair-bay"]} />
      </PanZoom>
    </div>
  );
}

/** @param {{ def: Geomorph.LayoutDef; transform?: string }} _ */
function Geomorph({ def, transform }) {
  const gm = computeLayout(def); // TODO use useQuery?
  const [{pngRect}, ...symbols] = gm.symbols;

  return (
    <g transform={transform}>
      <image className="debug" href={gm.pngHref} x={pngRect.x} y={pngRect.y}/>
      <image className="underlay" href={gm.underlay} x={gm.hullRect.x * 2} y={gm.hullRect.y * 2} />
      {symbols.map((s, i) =>
        <g key={i} transform={s.transform}>
          <image className="symbol" href={s.pngHref} x={s.pngRect.x}  y={s.pngRect.y}/>
        </g>
      )}
      <image className="overlay" href={gm.overlay} x={gm.hullRect.x * 2} y={gm.hullRect.y * 2} />
    </g>
  );
}

const initViewBox = new Rect(0, 0, 1200, 600);
const gridBounds = new Rect(-5000, -5000, 10000 + 1, 10000 + 1);
const rootCss = css`
  height: 100%;
  image.debug {
    opacity: 0.3;
  }
  image.symbol {
    transform: scale(0.2);
  }
  image.underlay, image.overlay {
    transform: scale(0.5);
  }
`;

/**
 * @param {Geomorph.LayoutDef} def
 * @returns {Geomorph.LayoutWithLayers}
 */
function computeLayout(def) {
  const symbolLookup = deserializeSvgJson(/** @type {*} */ (svgJson));
  const layout = createLayout(def, symbolLookup);

  const overlay = document.createElement('canvas');
  const underlay = document.createElement('canvas');
  renderAuxCanvases(layout, symbolLookup, overlay, underlay);

  return { ...layout,
    overlay: overlay.toDataURL(),
    underlay: underlay.toDataURL(),
  };
}
