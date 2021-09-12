import * as React from "react";
import { css } from "goober";
import { useQuery } from "react-query";
import { Rect } from "../geom";
import PanZoom from '../panzoom/PanZoom';
import { createLayout, deserializeSvgJson } from "./service";
import { drawTriangulation, fillPolygon, fillRing } from '../service';

// TODO load pre-parsed data from svg.json
// TODO create single image with all symbols?

export default function GeomorphTest2() {
  const gm = useSymbolLayout(layout301);
  console.log({ gm });

  return (
    <div className={rootCss}>
      <PanZoom initViewBox={initViewBox} gridBounds={gridBounds} maxZoom={5}>
        {gm && <g>
          <image className="debug" href={gm.pngHref} x={gm.pngRect.x} y={gm.pngRect.y}/>
          <image className="underlay" href={gm.underlay} x={gm.hullRect.x} y={gm.hullRect.y} />
          {gm.symbols.map((s, i) =>
            <g key={i} transform={s.transform}>
              <image className="symbol" href={s.pngHref} x={s.pngRect.x}  y={s.pngRect.y}/>
            </g>
          )}
          <image className="overlay" href={gm.overlay} x={gm.hullRect.x} y={gm.hullRect.y} />
        </g>}
      </PanZoom>
    </div>
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
`;

/** @param {Geomorph.LayoutDef} def */
function useSymbolLayout(def) {
  const symbolLookup = useSymbolLookup();

  if (symbolLookup) {
    const layout = createLayout(def, symbolLookup);
    const { overlay, underlay } = createAuxCanvases(layout, symbolLookup);
    return {
      overlay: overlay.toDataURL(),
      underlay: underlay.toDataURL(),
      ...layout,
    };
  }
}

function useSymbolLookup() {
  return useQuery('svg-json',
    () => fetch('/symbol/svg.json')
      .then(x => x.json())
      .then(x => deserializeSvgJson(x)),
  ).data;
}

/** @type {Geomorph.LayoutDef} */
const layout301 = {
  key: 'g-301--bridge',
  id: 301,
  items: [
    { symbol: '301--hull', tags: ['doors']  }, // Hull must be first
    { symbol: 'misc-stellar-cartography--023--4x4', transform: [-1, 0, 0, 1, 1200, 360] },
    { symbol: 'stateroom--014--2x2', transform: [1, 0, 0, -1, 0, 480] },
    { symbol: 'stateroom--014--2x2', transform: [1, 0, 0, -1, 120, 480] },
    { symbol: 'office--001--2x2', transform: [-1, 0, 0, 1, 240, 120], tags: ['door-s'] },
    { symbol: 'office--001--2x2', transform: [1, 0, 0, 1, 960, 120], tags: ['door-s'] },
    { symbol: 'stateroom--036--2x4' },
    { symbol: 'stateroom--036--2x4', transform: [-1, 0, 0, 1, 1200, 0] },
    { symbol: 'stateroom--036--2x4', transform: [0, -1, 1, 0, 0, 600] },
    { symbol: 'bridge--042--8x9', transform: [1, 0, 0, 1, 360, 60] },
    { symbol: 'iris-valves--005--1x1', transform: [0, -1, 1, 0, 0, 360] },
    { symbol: 'iris-valves--005--1x1', transform: [0, 1, 1, 0, 1140, 240] },
    { symbol: 'iris-valves--005--1x1', transform: [-1, 0, 0, 1, 360, 540] },
    { symbol: 'iris-valves--005--1x1', transform: [-1, 0, 0, 1, 960, 540] },
    { symbol: 'console--031--1x1.2', transform: [-1, 0, 0, 1, 360, 60] },
    { symbol: 'console--031--1x1.2', transform: [1, 0, 0, 1, 840, 60] },
  ],
};

/**
 * @param {Geomorph.Layout} layout
 * @param {Geomorph.SymbolLookup} lookup 
 */
function createAuxCanvases(layout, lookup) {
  const hull = lookup[layout.symbols[0].key];
  const hullRect = /** @type {Geom.RectJson} */ (hull.meta.hullRect);

  const oc = document.createElement('canvas');
  const uc = document.createElement('canvas');
  oc.width = hull.meta.pngRect.width, oc.height = hull.meta.pngRect.height;
  uc.width = hull.meta.pngRect.width, uc.height = hull.meta.pngRect.height;
  /** @type {[CanvasRenderingContext2D, CanvasRenderingContext2D]} */
  const [oCtxt, uCtxt] = ([oc.getContext('2d'), uc.getContext('2d')]);
  
  const hullOutline = hull.walls[0].outline;
  uCtxt.translate(-hullRect.x, -hullRect.y);
  uCtxt.fillStyle = 'rgba(100, 0, 0, 0.1)';
  uCtxt.strokeStyle = 'rgba(0, 0, 0, 0.2)';
  fillRing(uCtxt, hullOutline);
  uCtxt.fillStyle = 'rgba(0, 0, 200, 0.03)';
  fillPolygon(uCtxt, layout.navPoly);
  // const decomps = layout.navPoly.flatMap(x => x.qualityTriangulate());
  // decomps.forEach(decomp => drawTriangulation(uCtxt, decomp));
  uCtxt.resetTransform();
  
  const {
    doors,
    labels,
    obstacles,
    walls,
  } = layout.actual;

  oCtxt.translate(-hullRect.x, -hullRect.y);
  oCtxt.fillStyle = 'rgba(0, 200, 0, 1)';
  fillPolygon(oCtxt, doors);
  oCtxt.fillStyle = 'rgba(200, 50, 50, .2)';
  fillPolygon(oCtxt, walls);
  oCtxt.fillStyle = 'rgba(100, 0, 0, 0.05)';
  fillPolygon(oCtxt, obstacles);
  oCtxt.fillStyle = 'rgba(0, 0, 0, 0.04)';
  fillPolygon(oCtxt, labels);
  oCtxt.resetTransform();
  
  return { overlay: oc, underlay: uc };
}
