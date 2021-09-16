import * as React from "react";
import { css } from "goober";
import { useQuery } from "react-query";
import { Rect } from "../geom";
import PanZoom from '../panzoom/PanZoom';
import { createLayout, deserializeSvgJson, filterSingles } from "./geomorph.model";
import { drawTriangulation, fillPolygon, fillRing } from '../service';
import svgJson from '../../public/symbol/svg.json';
import layoutDefs from "./layout-defs";

export default function GeomorphDemo() {
  useQuery('focus-trigger', () => {}); // TODO only trigger in dev
  return (
    <div className={rootCss}>
      <PanZoom initViewBox={initViewBox} gridBounds={gridBounds} maxZoom={6}>
        {/* <Geomorph def={layoutDefs["g-301--bridge"]} /> */}
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
  if (hullSym.hull.length === 1 && hullSym.hull[0].holes.length) {
    const hullOutline = hullSym.hull[0].outline;
    fillRing(uctx, hullOutline);
  } else {
    console.error('hull walls: must exist, be connected, have a hole');
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
  octx.fillStyle = 'rgba(0, 0, 0, 1)';
  fillPolygon(octx, doors);
  octx.fillStyle = 'rgba(255, 255, 255, 1)';
  fillPolygon(octx, doors.flatMap(x => x.createInset(2)));
  octx.resetTransform();
  //#endregion
  
  return { overlay: oc, underlay: uc };
}
