import { Vect } from "../geom";
import { filterSingles } from './geomorph.model';
import { drawLine, drawTriangulation, fillPolygon, fillRing, loadImage, setStyle } from '../service';

/**
 * Render a single geomorph PNG without doors
 * @param {Geomorph.Layout} layout
 * @param {Geomorph.SymbolLookup} lookup
 * @param {HTMLCanvasElement | import('canvas').Canvas} canvas
 */
export async function renderGeomorph(layout, lookup, canvas) {
  const hullSym = lookup[layout.items[0].key];

  const pngRect = hullSym.pngRect;
  canvas.width = pngRect.width * 2, canvas.height = pngRect.height * 2;
  /** @type {CanvasRenderingContext2D} */
  const ctxt = (canvas.getContext('2d'));
  ctxt.scale(2, 2);
  ctxt.translate(-pngRect.x, -pngRect.y);

  //#region underlay
  ctxt.fillStyle = 'rgba(100, 100, 100, 0.4)';
  if (hullSym.hull.length === 1 && hullSym.hull[0].holes.length) {
    const hullOutline = hullSym.hull[0].outline;
    fillRing(ctxt, hullOutline);
  } else {
    console.error('hull walls: must exist, be connected, have a hole');
  }
  ctxt.fillStyle = 'rgba(0, 0, 100, 0.2)';
  fillPolygon(ctxt, layout.navPoly);

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
    const image = await loadImage(pngHref);
    ctxt.save();
    transformArray && ctxt.transform(...transformArray);
    ctxt.scale(0.2, 0.2);
    ctxt.drawImage(image, pngRect.x, pngRect.y);
    ctxt.restore();
  }
  //#endregion

  //#region overlay
  const { singles, obstacles, walls } = layout.groups;
  const doors = filterSingles(singles, 'door');
  const labels = filterSingles(singles, 'label');
  ctxt.fillStyle = 'rgba(0, 100, 0, 0.3)';
  fillPolygon(ctxt, obstacles);
  ctxt.fillStyle = 'rgba(100, 0, 0, 0.3)';
  fillPolygon(ctxt, walls);
  ctxt.fillStyle = 'rgba(0, 0, 0, 0.1)';
  fillPolygon(ctxt, labels);
  ctxt.fillStyle = 'rgba(0, 0, 0, 1)';
  fillPolygon(ctxt, layout.hullTop);
  singles.forEach(({ poly, tags }) => {
    if (tags.includes('wall')) {
      ctxt.fillStyle = 'rgba(0, 0, 0, 1)';
      fillPolygon(ctxt, [poly]);
    }
  });
  // Doors
  // ctxt.fillStyle = 'rgba(0, 0, 0, 1)';
  // fillPolygon(ctxt, doors);
  // ctxt.fillStyle = 'rgba(255, 255, 255, 1)';
  // fillPolygon(ctxt, doors.flatMap(x => x.createInset(2)));
  //#endregion
}


/**
 * @param {Geomorph.Layout} layout
 * @param {Geomorph.SymbolLookup} lookup
 * @param {HTMLCanvasElement | import('canvas').Canvas} oc Overlay canvas
 * @param {HTMLCanvasElement | import('canvas').Canvas} uc Underlay canvas
 */
export function renderAuxCanvases(layout, lookup, oc, uc) {
  const hullSym = lookup[layout.items[0].key];
  
  const hullRect = layout.hullRect;
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
  // uctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
  // const decomps = layout.navPoly.flatMap(x => x.qualityTriangulate());
  // decomps.forEach(decomp => drawTriangulation(uctx, decomp));

  uctx.lineJoin = 'round';
  hullSym.singles.forEach(({ poly, tags }) => {
    if (tags.includes('machine-base')) {
      setStyle(uctx, '#fff', '#000', 4);
      fillPolygon(uctx, [poly]), uctx.stroke();
    }
    if (tags.includes('machine')) {
      setStyle(uctx, '#ccc', '#000', 4);
      fillPolygon(uctx, [poly]), uctx.stroke();
    }
    if (tags.includes('fuel')) {
      setStyle(uctx, '#aaa', '#000', 2);
      fillPolygon(uctx, [poly]), uctx.stroke();
      setStyle(uctx, '#aaa', 'rgba(0, 0, 0, 0.5)', 1);
      const center = Vect.average(poly.outline);
      poly.outline.forEach(p => drawLine(uctx, center, p));
    }
  });
  uctx.resetTransform();
  //#endregion

  //#region overlay
  const { singles, obstacles, walls } = layout.groups;
  const doors = filterSingles(singles, 'door');
  const labels = filterSingles(singles, 'label');
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
}
