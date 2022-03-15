import chalk from "chalk";
import { Poly, Vect } from "../geom";
import { labelMeta } from './geomorph.model';
import { singlesToPolys } from '../service/geomorph';
import { drawLine, drawTriangulation, fillPolygon, fillRing, setStyle, strokePolygon } from '../service/dom';

/**
 * Render a single geomorph PNG,
 * optionally with e.g. doors.
 * @param {Geomorph.ParsedLayout} layout
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
  [canvas.width, canvas.height] = [pngRect.width * scale, pngRect.height * scale];

  const ctxt = /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d'));
  ctxt.scale(scale, scale);
  ctxt.translate(-pngRect.x, -pngRect.y);

  //#region underlay
  ctxt.fillStyle = floorColor;
  if (hullSym.hull.length === 1 && hullSym.hull[0].holes.length) {
    const hullOutline = hullSym.hull[0].outline;
    fillRing(ctxt, hullOutline);
  } else {
    console.error(chalk.red('hull walls must: exist, be connected, have a hole'));
  }

  ctxt.fillStyle = navColor;
  fillPolygon(ctxt, layout.navPoly);
  if (navTris) {
    ctxt.strokeStyle = navStroke;
    ctxt.lineWidth = 0.5;
    drawTriangulation(ctxt, layout.navDecomp)
    // Original approach
    // const decomps = layout.navPoly.flatMap(x => x.qualityTriangulate());
    // decomps.forEach(decomp => drawTriangulation(ctxt, decomp));
  }

  ctxt.lineJoin = 'round';
  hullSym.singles.forEach(({ poly, tags }) => {
    if (tags.includes('label')) {
      return;
    }
    if (tags.includes('poly')) {
      const matched = (tags[1] || '').match(/^([^-]*)-([^-]*)-([^-]*)$/);
      if (matched) {
        const [, fill, stroke, strokeWidth] = matched;
        setStyle(ctxt, fill || 'transparent', stroke || 'transparent', Number(strokeWidth) || 0);
        fillPolygon(ctxt, [poly]), ctxt.stroke();
      } else {
        console.warn('render: saw tag "poly" where other tag had unexpected format');
      }
    }
    if (tags.includes('fuel')) {
      setStyle(ctxt, '#aaa', '#000', 2);
      fillPolygon(ctxt, [poly]), ctxt.stroke();
      setStyle(ctxt, '#aaa', 'rgba(0, 0, 0, 0.5)', 1);
      const center = Vect.average(poly.outline);
      poly.outline.forEach(p => drawLine(ctxt, center, p));
    }
    if (tags.includes('wall')) {// Hull wall singles
      setStyle(ctxt, 'rgba(50, 50, 50, 0.2)');
      fillPolygon(ctxt, [poly]);
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
  // Draw walls without drawing them over windows
  const wallsSansWindows = Poly.cutOut(singlesToPolys(singles, 'window'), walls);
  ctxt.fillStyle = 'rgba(0, 0, 0, 1)';
  fillPolygon(ctxt, wallsSansWindows);

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
