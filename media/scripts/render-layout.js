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

import layoutDefs from '../../projects/geomorph/layout-defs';
import { createLayout, deserializeSvgJson } from '../../projects/geomorph/geomorph.model';
import svgJson from '../../public/symbol/svg.json';
import { renderAuxCanvases } from '../../projects/geomorph/geomorph.render';

// TODO larger images including guns
// TODO scale up main for better resolution

run();

async function run() {
  // const def = layoutDefs['g-301--bridge']; // hard-coded
  const def = layoutDefs['g-302--xboat-repair-bay']; // hard-coded
  const outputDir = path.resolve(__dirname, '../unsorted/test');
  fs.mkdirSync(outputDir, { recursive: true });

  const { layout, overlay, underlay } = computeLayout(def);
  const main = await createMainCanvas(layout);

  Promise.all([
    pipeline(underlay.createPNGStream(),
      fs.createWriteStream(path.resolve(outputDir, 'underlay.png')),
    ),
    pipeline(overlay.createPNGStream(),
      fs.createWriteStream(path.resolve(outputDir, 'overlay.png')),
    ),
    pipeline(main.createPNGStream(),
      fs.createWriteStream(path.resolve(outputDir, 'main.png')),
    ),
  ]);
}

/** @param {Geomorph.LayoutDef} def */
function computeLayout(def) {
  const symbolLookup = deserializeSvgJson(/** @type {*} */ (svgJson));
  const layout = createLayout(def, symbolLookup);
  const hullRect = layout.hullRect;
  const overlay = createCanvas(2 * hullRect.width, 2 * hullRect.height);
  const underlay = createCanvas(2 * hullRect.width, 2 * hullRect.height);
  renderAuxCanvases(layout, symbolLookup, overlay, underlay);
  return { layout, overlay, underlay };
}

/** @param {Geomorph.Layout} layout */
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