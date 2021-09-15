/**
 * Usage: `yarn render-layout`
 */
/// <reference path="./deps.d.ts"/>

import fs from 'fs';
import path from 'path';
import util from 'util';
import { createCanvas, loadImage } from 'canvas';
import stream from 'stream';
const pipeline = util.promisify(stream.pipeline);

import { layout301 } from '../../projects/geomorph/layout-defs';
import {
  createLayout,
  deserializeSvgJson,
  filterSingles,
} from '../../projects/geomorph/geomorph.model';
import svgJson from '../../public/symbol/svg.json';
import { fillRing, fillPolygon } from '../../projects/service';

// TODO larger images including guns
// TODO scale up main for better resolution

run();

async function run() {
  const def = layout301; // hard-coded
  const unsortedDir = path.resolve(__dirname, '../unsorted');
  const symbolLookup = deserializeSvgJson(/** @type {*} */ (svgJson));
  const layout = createLayout(def, symbolLookup);
  const { overlay, underlay } = createAuxCanvases(layout, symbolLookup);
  const main = await createMainCanvas(layout);
  
  const outputDir = path.resolve(unsortedDir, 'test');
  fs.mkdirSync(outputDir, { recursive: true });
  
  Promise.all([
    pipeline(
      underlay.createPNGStream(),
      fs.createWriteStream(path.resolve(outputDir, 'underlay.png')),
    ),
    pipeline(
      overlay.createPNGStream(),
      fs.createWriteStream(path.resolve(outputDir, 'overlay.png')),
    ),
    pipeline(
      main.createPNGStream(),
      fs.createWriteStream(path.resolve(outputDir, 'main.png')),
    ),
  ]);
}

/**
 * @param {Geomorph.Layout} layout
 * @param {Geomorph.SymbolLookup} lookup 
 */
function createAuxCanvases(layout, lookup) {
  const hullSym = lookup[layout.symbols[0].key];
  const hullRect = layout.hullRect;
  const oc = createCanvas(2 * hullRect.width, 2 * hullRect.height);
  const uc = createCanvas(2 * hullRect.width, 2 * hullRect.height);
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

/**
 * @param {Geomorph.Layout} layout
 */
async function createMainCanvas(layout) {
  const [{pngRect}, ...symbols] = layout.symbols;
  const c = createCanvas(pngRect.width, pngRect.height);
  const ct = c.getContext('2d');
  for (const s of symbols) {
    ct.resetTransform();
    s.transformArray && ct.transform(...s.transformArray);
    ct.scale(0.2, 0.2);
    const pngPath = path.resolve(__dirname, '../../public' + s.pngHref);
    const img = await loadImage(fs.readFileSync(pngPath));
    ct.drawImage(img, s.pngRect.x, s.pngRect.y);
  }
  return c;
}