/**
 * Usage: `yarn render-layout 301`
 * Outputs a PNG and JSON in public/geomorph.
 */
/// <reference path="./deps.d.ts"/>
import fs from 'fs';
import path from 'path';
import util from 'util';
import stream from 'stream';
import { createCanvas, loadImage } from 'canvas';
import stringify from 'json-stringify-pretty-compact';

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

const publicDir = path.resolve(__dirname, '../../public');
const outputDir = path.resolve(publicDir, 'geomorph');
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

  pipeline(
    canvas.createPNGStream(),
    fs.createWriteStream(path.resolve(outputDir, `${layoutDef.key}.png`)),
  );

})();
