import { Vect } from "../geom";
import { singlesToPolys } from './geomorph.model';
import { drawLine, drawTriangulation, fillPolygon, fillRing, setStyle } from '../service';

/**
 * Render a single geomorph PNG without doors
 * @param {Geomorph.Layout} layout
 * @param {Geomorph.SymbolLookup} lookup
 * @param {Canvas} canvas
 * @param {(pngHref: string) => Promise<Image>} getPng
 * `pngHref` has local url format `/symbol/foo`
 * @param {Geomorph.RenderOpts} opts
 */
export async function renderGeomorph(
  layout, lookup, canvas, getPng,
  { scale, obsBounds = true, wallBounds = true, navTris = false, doors = false },
) {
  const hullSym = lookup[layout.items[0].key];
  const pngRect = hullSym.pngRect;
  canvas.width = pngRect.width * scale, canvas.height = pngRect.height * scale;

  /** @type {CanvasRenderingContext2D} */
  const ctxt = (canvas.getContext('2d'));
  ctxt.scale(scale, scale);
  ctxt.translate(-pngRect.x, -pngRect.y);

  //#region underlay
  // ctxt.fillStyle = 'rgba(100, 100, 100, 0.4)';
  ctxt.fillStyle = 'rgba(200, 200, 200, 1)';
  if (hullSym.hull.length === 1 && hullSym.hull[0].holes.length) {
    const hullOutline = hullSym.hull[0].outline;
    fillRing(ctxt, hullOutline);
  } else {
    console.error('hull walls: must exist, be connected and have a hole');
  }

  ctxt.fillStyle = 'rgba(0, 0, 100, 0.2)';
  fillPolygon(ctxt, layout.navPoly);
  if (navTris) {
    ctxt.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    const decomps = layout.navPoly.flatMap(x => x.qualityTriangulate());
    decomps.forEach(decomp => drawTriangulation(ctxt, decomp));
  }

  ctxt.lineJoin = 'round';
  hullSym.singles.forEach(({ poly, tags }) => {
    if (tags.includes('machine-base')) {
      setStyle(ctxt, '#fff', '#000', 4);
      fillPolygon(ctxt, [poly]), ctxt.stroke();
    }
    if (tags.includes('machine')) {
      setStyle(ctxt, '#ccc', '#000', 4);
      fillPolygon(ctxt, [poly]), ctxt.stroke();
    }
    if (tags.includes('fuel')) {
      setStyle(ctxt, '#aaa', '#000', 2);
      fillPolygon(ctxt, [poly]), ctxt.stroke();
      setStyle(ctxt, '#aaa', 'rgba(0, 0, 0, 0.5)', 1);
      const center = Vect.average(poly.outline);
      poly.outline.forEach(p => drawLine(ctxt, center, p));
    }
  });
  //#endregion

  //#region symbol PNGs
  const innerItems = layout.items.slice(1);
  for (const { pngHref, pngRect, transformArray } of innerItems) {
    ctxt.save();
    const image = await getPng(pngHref);
    transformArray && ctxt.transform(...transformArray);
    ctxt.scale(0.2, 0.2);
    ctxt.drawImage(/** @type {*} */ (image), pngRect.x, pngRect.y);
    ctxt.restore();
  }
  //#endregion

  //#region overlay
  const { singles, obstacles, walls } = layout.groups;
  // const labels = filterSingles(singles, 'label');
  // ctxt.fillStyle = 'rgba(0, 0, 0, 0.1)';
  // fillPolygon(ctxt, labels);
  ctxt.fillStyle = 'rgba(0, 100, 0, 0.3)';
  obsBounds && fillPolygon(ctxt, obstacles);
  ctxt.fillStyle = 'rgba(100, 0, 0, 0.3)';
  wallBounds && fillPolygon(ctxt, walls);
  ctxt.fillStyle = 'rgba(0, 0, 0, 1)';
  fillPolygon(ctxt, layout.hullTop);
  singles.forEach(({ poly, tags }) => {
    if (tags.includes('wall')) {
      ctxt.fillStyle = 'rgba(0, 0, 0, 1)';
      fillPolygon(ctxt, [poly]);
    }
  });
  if (doors) {
    const doors = singlesToPolys(singles, 'door');
    ctxt.fillStyle = 'rgba(0, 0, 0, 1)';
    fillPolygon(ctxt, doors);
    ctxt.fillStyle = 'rgba(255, 255, 255, 1)';
    fillPolygon(ctxt, doors.flatMap(x => x.createInset(2)));
  }
  //#endregion
}

/** @typedef {HTMLCanvasElement | import('canvas').Canvas} Canvas */
/** @typedef {HTMLImageElement | import('canvas').Image} Image */
