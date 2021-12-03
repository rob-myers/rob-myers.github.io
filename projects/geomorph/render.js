import { Vect } from "../geom";
import { labelMeta } from './geomorph.model';
import { singlesToPolys } from '../service/geomorph';
import { drawLine, drawTriangulation, fillPolygon, fillRing, setStyle, strokePolygon } from '../service/dom';
import { geom } from "projects/service/geom";

/**
 * Render a single geomorph PNG,
 * optionally with e.g. doors.
 * @param {Geomorph.Layout} layout
 * @param {Geomorph.SymbolLookup} lookup
 * @param {Canvas} canvas
 * @param {(pngHref: string) => Promise<Image>} getPng
 * `pngHref` has local url format `/symbol/foo`
 * @param {Geomorph.RenderOpts} opts
 */
export async function renderGeomorph(
  layout, lookup, canvas, getPng,
  {
    scale,
    obsBounds = true,
    wallBounds = true,
    navTris = false,
    doors = false,
    labels = false,
    floorColor = 'rgba(220, 220, 220, 1)',
    navColor = 'rgba(255, 255, 255, 0.8)',
    navStroke = 'rgba(0, 0, 0, 0.15)',
    obsColor = 'rgba(100, 100, 100, 0.45)',
    wallColor = 'rgba(50, 40, 40, 0.5)',
  },
) {
  const hullSym = lookup[layout.items[0].key];
  const pngRect = hullSym.pngRect;
  canvas.width = pngRect.width * scale, canvas.height = pngRect.height * scale;

  /** @type {CanvasRenderingContext2D} */
  const ctxt = (canvas.getContext('2d'));
  ctxt.scale(scale, scale);
  ctxt.translate(-pngRect.x, -pngRect.y);

  //#region underlay
  ctxt.fillStyle = floorColor;
  if (hullSym.hull.length === 1 && hullSym.hull[0].holes.length) {
    const hullOutline = hullSym.hull[0].outline;
    fillRing(ctxt, hullOutline);
  } else {
    console.error('hull walls must: exist, be connected, have a hole');
  }

  ctxt.fillStyle = navColor;
  fillPolygon(ctxt, layout.navPoly);
  if (navTris) {
    ctxt.strokeStyle = navStroke;
    ctxt.lineWidth = 0.5;
    const decomps = layout.navPoly.flatMap(x => x.qualityTriangulate());
    decomps.forEach(decomp => drawTriangulation(ctxt, decomp));
  }

  ctxt.lineJoin = 'round';
  hullSym.singles.forEach(({ poly, tags }) => {
    if (tags.includes('label')) {
      return;
    }
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

  ctxt.fillStyle = obsColor;
  obsBounds && fillPolygon(ctxt, obstacles);
  ctxt.fillStyle = wallColor;
  wallBounds && fillPolygon(ctxt, walls);
  ctxt.fillStyle = 'rgba(0, 0, 0, 1)';
  fillPolygon(ctxt, layout.hullTop);
  singles.forEach(({ poly, tags }) => {
    if (tags.includes('wall')) {
      ctxt.fillStyle = 'rgba(0, 0, 0, 1)';
      fillPolygon(ctxt, [poly]);
    }
  });

  // // Outset testing
  // // We do not support polygon outlines which self-intersect after being outset
  // setStyle(ctxt, 'rgba(0, 0, 0, 0.5)', 'red', 2);
  // strokePolygon(ctxt, walls.flatMap(x => new Poly(Poly.insetRing(x.outline, -12))) );

  if (doors) {
    const doors = singlesToPolys(singles, 'door');
    ctxt.fillStyle = 'rgba(0, 0, 0, 1)';
    fillPolygon(ctxt, doors);
    ctxt.fillStyle = 'rgba(255, 255, 255, 1)';
    fillPolygon(ctxt, doors.flatMap(x => x.createInset(2)));
  }

  if (labels) {
    ctxt.font = labelMeta.font;
    ctxt.textBaseline = 'top';
    for (const { text, rect, padded } of layout.labels) {
      ctxt.fillStyle = 'black';
      ctxt.fillRect(padded.x, padded.y, padded.width, padded.height);
      ctxt.fillStyle = 'white';
      ctxt.fillText(text, rect.x, rect.y)
    }
  }
  //#endregion
}

/** @typedef {HTMLCanvasElement | import('canvas').Canvas} Canvas */
/** @typedef {HTMLImageElement | import('canvas').Image} Image */
