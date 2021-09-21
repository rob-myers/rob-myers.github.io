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
import { renderGeomorph } from '../../projects/geomorph/geomorph.render';

// TODO output a single image (can change later)
// TODO output JSON info about doors/navmesh

// const def = layoutDefs['g-302--xboat-repair-bay'];
const def = layoutDefs['g-301--bridge'];
const pngInputDir = path.resolve(__dirname, '../../public');
const outputDir = path.resolve(__dirname, '../unsorted/test');
fs.mkdirSync(outputDir, { recursive: true });

/** @param {Geomorph.LayoutDef} def */
async function computeLayout(def) {
  const symbolLookup = deserializeSvgJson(/** @type {*} */ (svgJson));
  const layout = createLayout(def, symbolLookup);
  const canvas = createCanvas(0, 0);
  await renderGeomorph(
    layout,
    symbolLookup,
    canvas,
    (pngHref) => loadImage(fs.readFileSync(
      path.resolve(pngInputDir, pngHref.slice(1))
    )),
  );
  return { layout, canvas };
}

(async function run() {
  const { layout, canvas } = await computeLayout(def);

  Promise.all([
    pipeline(canvas.createPNGStream(),
      fs.createWriteStream(path.resolve(outputDir, 'canvas.png')),
    ),
  ]);
})();
