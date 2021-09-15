import * as React from "react";
import { css } from "goober";
import { useQuery } from "react-query";
import { Rect } from "../geom";
import PanZoom from '../panzoom/PanZoom';
import { createLayout, deserializeSvgJson, filterSingles } from "./geomorph.model";
import { drawTriangulation, fillPolygon, fillRing } from '../service';
import svgJson from '../../public/symbol/svg.json';

export default function GeomorphDemo() {
  useQuery('focus-trigger', () => {}); // TODO only trigger in dev
  return (
    <div className={rootCss}>
      <PanZoom initViewBox={initViewBox} gridBounds={gridBounds} maxZoom={6}>
        <Geomorph def={layout301} />
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
 * 
 * @param {Geomorph.LayoutDef} def
 * @returns {Geomorph.LayoutWithLayers}
 */
function computeLayout(def) {
  const symbolLookup = deserializeSvgJson(/** @type {*} */ (svgJson));
  const layout = createLayout(def, symbolLookup);
  const { overlay, underlay } = createAuxCanvases(layout, symbolLookup);
  return {
    overlay: overlay.toDataURL(),
    underlay: underlay.toDataURL(),
    ...layout,
  };
}

/** @type {Geomorph.LayoutDef} */
const layout301 = {
  key: 'g-301--bridge',
  id: 301,
  items: [
    { symbol: '301--hull', tags: ['door']  }, // Hull must be first
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
    { symbol: 'weaponry--013--1x2', transform: [-1, 0, 0, 1, 360, -60] },
    { symbol: 'weaponry--013--1x2', transform: [1, 0, 0, 1, 840, -60] },
  ],
};

/**
 * @param {Geomorph.Layout} layout
 * @param {Geomorph.SymbolLookup} lookup 
 */
function createAuxCanvases(layout, lookup) {
  const hullSym = lookup[layout.symbols[0].key];
  const hullRect = layout.hullRect;

  const oc = document.createElement('canvas');
  const uc = document.createElement('canvas');
  uc.width = hullRect.width * 2, uc.height = hullRect.height * 2;
  oc.width = hullRect.width * 2, oc.height = hullRect.height * 2;
  /** @type {[CanvasRenderingContext2D, CanvasRenderingContext2D]} */
  const [octx, uctx] = ([oc.getContext('2d'), uc.getContext('2d')]);
  uctx.scale(2, 2);
  uctx.translate(-hullRect.x, -hullRect.y);
  octx.scale(2, 2);
  octx.translate(-hullRect.x, -hullRect.y);

  //#region underlay
  uctx.fillStyle = 'rgba(100, 100, 100, 0.4)';
  if (hullSym.hull.length === 1) {
    const hullOutline = hullSym.hull[0].outline;
    fillRing(uctx, hullOutline);
  } else {
    console.error('hull walls must exist and be connected');
  }

  uctx.fillStyle = 'rgba(0, 0, 100, 0.2)';
  fillPolygon(uctx, layout.navPoly);
  // uCtxt.strokeStyle = 'rgba(0, 0, 0, 0.2)';
  // const decomps = layout.navPoly.flatMap(x => x.qualityTriangulate());
  // decomps.forEach(decomp => drawTriangulation(uCtxt, decomp));

  uctx.lineWidth = 4, uctx.lineJoin = 'round';
  hullSym.singles.forEach(({ poly, tags }) => {
    if (tags.includes('machine-base')) {
      uctx.fillStyle = 'white';
      fillPolygon(uctx, [poly]), uctx.stroke();
    }
    if (tags.includes('machine')) {
      uctx.fillStyle = '#ccc';
      fillPolygon(uctx, [poly]), uctx.stroke();
    }
  });
  uctx.resetTransform();
  //#endregion

  //#region overlay
  const { singles, obstacles, walls } = layout.actual;
  const doors = filterSingles(layout.actual, 'door');
  const labels = filterSingles(layout.actual, 'label');
  octx.fillStyle = 'rgba(0, 100, 0, 0.3)';
  fillPolygon(octx, obstacles);
  octx.fillStyle = 'rgba(100, 0, 0, 0.3)';
  fillPolygon(octx, walls);
  octx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  fillPolygon(octx, labels);
  octx.fillStyle = 'rgba(0, 0, 0, 1)';
  fillPolygon(octx, layout.hullTop);
  singles.forEach(({ poly, tags }) => {
    if (tags.includes('wall')) {
      octx.fillStyle = 'rgba(0, 0, 0, 1)';
      fillPolygon(octx, [poly]);
    }
  });
  // NOTE door stroke breaks canvas width
  octx.fillStyle = 'rgba(0, 0, 0, 1)';
  fillPolygon(octx, doors);
  octx.fillStyle = 'rgba(255, 255, 255, 1)';
  fillPolygon(octx, doors.flatMap(x => x.createInset(2)));
  octx.resetTransform();
  //#endregion
  
  return { overlay: oc, underlay: uc };
}
