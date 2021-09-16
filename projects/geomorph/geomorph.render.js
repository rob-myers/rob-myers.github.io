import { Vect } from "../geom";
import { filterSingles } from './geomorph.model';
import { drawLine, drawTriangulation, fillPolygon, fillRing, setStyle } from '../service';

/**
 * @param {Geomorph.Layout} layout
 * @param {Geomorph.SymbolLookup} lookup
 * @param {HTMLCanvasElement | import('canvas').Canvas} oc Overlay canvas
 * @param {HTMLCanvasElement | import('canvas').Canvas} uc Underlay canvas
 */
export function renderAuxCanvases(layout, lookup, oc, uc) {
  const hullSym = lookup[layout.symbols[0].key];
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
  const { singles, obstacles, walls } = layout.actual;
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
