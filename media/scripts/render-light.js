/**
 * - Usage:
 *   - `yarn render-light 301`
 *   - `yarn render-light 301 --suffix=test`
 *   - `yarn render-light 301 --scale=1`
 * - Outputs a PNG in public/geomorph.
 */
/// <reference path="./deps.d.ts"/>
import path from 'path';
import fs from 'fs';
import util from 'util';
import stream from 'stream';
import getOpts from 'getopts';
import { createCanvas, loadImage } from 'canvas';

import layoutDefs from "../../projects/geomorph/layouts";
import svgJson from '../../public/symbol/svg.json';
import { Vect } from '../../projects/geom';
import { geom } from '../../projects/service/geom';
import { createLayout, deserializeSvgJson } from '../../projects/service/geomorph';
import { triangle } from '../../projects/service/triangle';
import { fillPolygon } from '../../projects/service/dom';

const geomorphId = Number(process.argv[2]);
const layoutDef = Object.values(layoutDefs).find(x => x.id === geomorphId);
if (!layoutDef) {
  console.error(`No geomorph found with id "${geomorphId}"`);
  process.exit(1);
}

const opts = getOpts(process.argv);
const [suffix, scale] = [opts.suffix, Number(opts.scale) || 2];
const publicDir = path.resolve(__dirname, '../../public');
const outputDir = path.resolve(publicDir, 'geomorph');
const outputPath =  path.resolve(outputDir, `${layoutDef.key}.light${suffix ? `.${suffix}` : ''}.png`);

(async function run() {

  const symbolLookup = deserializeSvgJson(/** @type {*} */ (svgJson));
  const layout = await createLayout(layoutDef, symbolLookup, triangle);

  const hullSym = symbolLookup[layout.items[0].key];
  const pngRect = hullSym.pngRect;

  const canvas = createCanvas(pngRect.width * scale, pngRect.height * scale);
  const ctxt = /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d'));
  ctxt.scale(scale, scale);
  ctxt.translate(-pngRect.x, -pngRect.y);
  ctxt.fillStyle = 'red'; // TEST

  const polys = layout.walls;
  const triangs = polys.flatMap(poly => geom.triangulationToPolys(poly.fastTriangulate()));
  layoutDef.lights.forEach(({ def: [p, distance, intensity, layerId] }) => {
    const position = Vect.from(p)
    const poly = geom.lightPolygon(position, 1000, triangs);
    fillPolygon(ctxt, [poly]);
  });

  await util.promisify(stream.pipeline)(
    canvas.createPNGStream(), 
    fs.createWriteStream(outputPath),
  );

})();
