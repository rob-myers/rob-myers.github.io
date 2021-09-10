import * as React from "react";
import { css } from "goober";
import { useQuery } from "react-query";
import { SymbolLayout, ParsedSvgJson } from './types';
import { RectJson } from "../geom/types";
import { Rect } from "../geom";
import PanZoom from '../panzoom/PanZoom';
import { deserializeSvgJson } from "./parse-symbol";

// TODO load pre-parsed data from svg.json
// TODO create single image with all symbols?

export default function GeomorphTest2() {
  const gm = useSymbolLayout(layout301);
  console.log({ gm });

  return (
    <div className={rootCss}>
      <PanZoom initViewBox={initViewBox} gridBounds={gridBounds} maxZoom={5}>
        <g>
          {gm && <>
            <image className="debug" href={gm.pngHref} x={gm.pngRect.x} y={gm.pngRect.y}/>
            <image className="underlay" href={gm.underlay} x={gm.hullRect.x} y={gm.hullRect.y} />
            {gm.symbols.map((s, i) =>
              <g key={i} transform={s.transform}>
                <image className="symbol" href={s.pngHref} x={s.pngRect.x}  y={s.pngRect.y}/>
              </g>
            )}
            <image className="overlay" href={gm.overlay} {...gm.pngRect} />
          </>}
        </g>
      </PanZoom>
    </div>
  );
}

/** @param {SymbolLayout} layout */
function useSymbolLayout(layout) {
  const symbolData = useSymbolData();
  /**
   * IN PROGRESS
   */
  if (symbolData) {
    const items = layout.items;
    const symbols = items.map(x => symbolData[x.symbol]);
    const { overlay, underlay } = createAuxCanvases(layout, symbolData);

    return {
      overlay: overlay.toDataURL(),
      underlay: underlay.toDataURL(),
      hullRect: /** @type {RectJson} */ (symbols[0].hullRect),
      pngHref: `/debug/${layout.key}.png`,
      pngRect: symbols[0].pngRect,

      symbols: symbols.map((sym, i) => ({
        pngHref: `/symbol/${sym.key}.png`,
        pngRect: sym.pngRect,
        transformArray: items[i].transform,
        transform: items[i].transform ? `matrix(${items[i].transform})` : undefined,
      })),
    };
  }
}

function useSymbolData() {
  return useQuery('svg-json',
    () => fetch('/symbol/svg.json')
      .then(x => x.json())
      .then(x => deserializeSvgJson(x)),
  ).data;
}

/** @type {SymbolLayout} */
const layout301 = {
  key: 'g-301--bridge',
  id: 301,
  items: [
    { symbol: '301--hull', hull: true },
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

/**
 * @param {SymbolLayout} layout
 * @param {ParsedSvgJson} symbolData 
 */
function createAuxCanvases(layout, symbolData) {
  const symbols = layout.items.map(x => symbolData[x.symbol]);
  const { pngRect, hullRect, hull: hullPolys } = symbols[0];

  const oc = document.createElement('canvas');
  const uc = document.createElement('canvas');
  oc.width = pngRect.width, oc.height = pngRect.height;
  uc.width = pngRect.width, uc.height = pngRect.height;
  /** @type {[CanvasRenderingContext2D, CanvasRenderingContext2D]} */
  const [oct, uct] = ([oc.getContext('2d'), uc.getContext('2d')]);

  const hullOutline = hullPolys[0].outline;
  uct.fillStyle = 'rgba(0, 0, 100, 0.2)';
  hullRect && uct.translate(-hullRect.x, -hullRect.y);
  uct.moveTo(hullOutline[0].x, hullOutline[0].y);
  hullOutline.forEach(p => uct.lineTo(p.x, p.y));
  uct.fill();
  hullRect && uct.translate(hullRect.x, hullRect.y);

  return { overlay: oc, underlay: uc };
}