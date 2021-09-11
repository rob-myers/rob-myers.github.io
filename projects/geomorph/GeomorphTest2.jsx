import * as React from "react";
import { css } from "goober";
import { useQuery } from "react-query";
import { Rect } from "../geom";
import PanZoom from '../panzoom/PanZoom';
import { createLayout, deserializeSvgJson } from "./parse-symbol";
import { fillPolygon, fillRing } from '../service';

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
    // { refetchOnWindowFocus: false },
  ).data;
}

/** @type {Geomorph.LayoutDef} */
const layout301 = {
  key: 'g-301--bridge',
  id: 301,
  items: [
    { symbol: '301--hull', hull: true }, // Hull must be first
    { symbol: 'misc-stellar-cartography--023--4x4', transform: [-1, 0, 0, 1, 1200, 360] },
    { symbol: 'stateroom--014--2x2', transform: [1, 0, 0, -1, 0, 480] },
    { symbol: 'stateroom--014--2x2', transform: [1, 0, 0, -1, 120, 480] },
    { symbol: 'office--001--2x2', transform: [-1, 0, 0, 1, 240, 120], tags: ['has-door-s'] },
    { symbol: 'office--001--2x2', transform: [1, 0, 0, 1, 960, 120], tags: ['has-door-s'] },
    { symbol: 'stateroom--036--2x4' },
    { symbol: 'stateroom--036--2x4', transform: [-1, 0, 0, 1, 1200, 0] },
    { symbol: 'stateroom--036--2x4', transform: [0, -1, 1, 0, 0, 600] },
    { symbol: 'bridge--042--8x9', transform: [1, 0, 0, 1, 360, 60] },
  ],
};

/**
 * @param {Geomorph.Layout} layout
 * @param {Geomorph.SymbolLookup} lookup 
 */
function createAuxCanvases(layout, lookup) {
  const hull = lookup[layout.hullKey];
  const hullRect = layout.hullRect;

  const oc = document.createElement('canvas');
  const uc = document.createElement('canvas');
  oc.width = hull.meta.pngRect.width, oc.height = hull.meta.pngRect.height;
  uc.width = hull.meta.pngRect.width, uc.height = hull.meta.pngRect.height;
  /** @type {[CanvasRenderingContext2D, CanvasRenderingContext2D]} */
  const [oct, uct] = ([oc.getContext('2d'), uc.getContext('2d')]);
  
  const hullOutline = hull.hull[0].outline;
  uct.translate(-hullRect.x, -hullRect.y);
  uct.fillStyle = 'rgba(0, 0, 100, 0.2)';
  fillRing(uct, hullOutline);
  uct.resetTransform();
  
  oct.translate(-hullRect.x, -hullRect.y);
  oct.fillStyle = 'rgba(200, 50, 50, .5)';
  fillPolygon(oct, ...hull.hull);
  oct.fillStyle = 'rgba(0, 200, 0, 0.2)';
  fillPolygon(oct, ...hull.doors);
  
  const {
    doors,
    irisValves,
    labels,
    obstacles,
    walls,
  } = layout.actual;

  oct.fillStyle = 'rgba(0, 200, 0, 1)';
  fillPolygon(oct, ...doors);
  fillPolygon(oct, ...irisValves);
  oct.fillStyle = 'rgba(200, 50, 50, .05)';
  fillPolygon(oct, ...walls);
  oct.fillStyle = 'rgba(100, 100, 150, 0.2)';
  fillPolygon(oct, ...obstacles);
  oct.fillStyle = 'rgba(0, 0, 0, 0.1)';
  fillPolygon(oct, ...labels);
  oct.resetTransform();
  
  return { overlay: oc, underlay: uc };
}
