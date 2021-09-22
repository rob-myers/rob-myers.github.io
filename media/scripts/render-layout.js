/**
 * Usage: `yarn render-layout 301`
 */
/// <reference path="./deps.d.ts"/>
import fs from 'fs';
import path from 'path';
import util from 'util';
import stream from 'stream';
import { createCanvas, loadImage } from 'canvas';

import svgJson from '../../public/symbol/svg.json';
import layoutDefs from '../../projects/geomorph/layout-defs';
import { createLayout, deserializeSvgJson } from '../../projects/geomorph/geomorph.model';
import { renderGeomorph } from '../../projects/geomorph/geomorph.render';

// TODO output JSON info about doors/navmesh

const geomorphId = Number(process.argv[2]);
const layoutDef = Object.values(layoutDefs).find(x => x.id === geomorphId);

if (!layoutDef) {
  console.error(`No geomorph found with id "${geomorphId}"`);
  process.exit(1);
}

const publicDir = path.resolve(__dirname, '../../public');
const outputDir = path.resolve(__dirname, '../../public/geomorph');
fs.mkdirSync(outputDir, { recursive: true });
const scale = 2;

/** @param {Geomorph.LayoutDef} def */
async function computeLayout(def) {
  const symbolLookup = deserializeSvgJson(/** @type {*} */ (svgJson));
  const layout = createLayout(def, symbolLookup);
  const canvas = createCanvas(0, 0);
  await renderGeomorph(
    layout,
    symbolLookup,
    canvas,
    (pngHref) => loadImage(fs.readFileSync(path.resolve(publicDir + pngHref))),
    { scale, obsBounds: false, wallBounds: false },
  );
  return { layout, canvas };
}

(async function run() {
  const { layout, canvas } = await computeLayout(layoutDef);
  const pipeline = util.promisify(stream.pipeline);

  Promise.all([
    pipeline(
      canvas.createPNGStream(),
      fs.createWriteStream(path.resolve(outputDir, `${layoutDef.key}.png`)),
    ),
  ]);
})();
