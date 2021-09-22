/**
 * Usage: `yarn render-layout 301`
 * Usage: `yarn render-layout 301 --debug`
 * - Outputs a PNG and JSON in public/geomorph.
 * - Debug option creates a .debug.png with all features.
 */
/// <reference path="./deps.d.ts"/>
import fs from 'fs';
import path from 'path';
import util from 'util';
import stream from 'stream';
import { createCanvas, loadImage } from 'canvas';
import stringify from 'json-stringify-pretty-compact';
import getOpts from 'getopts';

import svgJson from '../../public/symbol/svg.json';
import layoutDefs from '../../projects/geomorph/layout-defs';
import { createLayout, deserializeSvgJson } from '../../projects/geomorph/geomorph.model';
import { renderGeomorph } from '../../projects/geomorph/geomorph.render';

const geomorphId = Number(process.argv[2]);
const layoutDef = Object.values(layoutDefs).find(x => x.id === geomorphId);

if (!layoutDef) {
  console.error(`No geomorph found with id "${geomorphId}"`);
  process.exit(1);
}

const debug = !!getOpts(process.argv).debug;
const publicDir = path.resolve(__dirname, '../../public');
const outputDir = path.resolve(publicDir, 'geomorph');
const outputPath =  path.resolve(outputDir, `${layoutDef.key}${debug ? '.debug.png' : '.png'}`)

/** @type {Geomorph.RenderOpts} */
const renderOpts = debug
  ? { scale: 2, obsBounds: true, wallBounds: true, doors: true }
  : { scale: 2, obsBounds: false, wallBounds: false };

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
    renderOpts,
  );
  return { layout, canvas };
}

(async function run() {
  const pipeline = util.promisify(stream.pipeline);
  const { layout, canvas } = await computeLayout(layoutDef);

  fs.writeFileSync(
    path.resolve(outputDir, `${layoutDef.key}.json`),
    stringify({
      key: layout.def.key,
      id: layout.def.id,
      pngRect: layout.items[0].pngRect,
      doors: layout.groups.singles
        .filter(x => x.tags.includes('door'))
        .map(({ poly, tags }) => ({ poly: poly.geoJson, tags })),
      navPoly: layout.navPoly.map(x => x.geoJson),
    })
  );

  pipeline(canvas.createPNGStream(), fs.createWriteStream(outputPath));
})();
