/**
 * Not yet sold i.e. we might not bother with this.
 */

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
import { fillPolygon, strokePolygon } from '../../projects/service/dom';

const geomorphId = Number(process.argv[2]);
const layoutDef = Object.values(layoutDefs).find(x => x.id === geomorphId);
if (!layoutDef) {
  console.error(`Error: no geomorph found with id "${geomorphId}"`);
  process.exit(1);
}

const opts = getOpts(process.argv);
const [suffix, scale] = [opts.suffix, Number(opts.scale) || 2];
const publicDir = path.resolve(__dirname, '../../public');
const outputDir = path.resolve(publicDir, 'geomorph');
const outputPath = path.resolve(outputDir, `${layoutDef.key}.light${suffix ? `.${suffix}` : ''}.png`);
const geomorphPNGPath =  path.resolve(outputDir, `${layoutDef.key}.png`);
if (!fs.existsSync(geomorphPNGPath)) {
  console.error(`Error: the PNG ${geomorphPNGPath} must exist`);
  process.exit(1);
}

(async function run() {

  const symbolLookup = deserializeSvgJson(/** @type {*} */ (svgJson));
  const layout = await createLayout(layoutDef, symbolLookup, triangle);

  const hullSym = symbolLookup[layout.items[0].key];
  const pngRect = hullSym.pngRect;

  // Compute the lights, assuming all doors are open
  const polys = layout.walls;
  const triangs = polys.flatMap(poly => geom.triangulationToPolys(poly.fastTriangulate()));
  const lights = layout.lights.map(({ def: [p, radius, intensity] }, index) => {
    const position = Vect.from(p)
    // const poly = geom.lightPolygon(position, 1000, triangs);
    const poly = geom.lightPolygon(position, 2 * radius, triangs);
    /** @type {Geomorph.Light} */
    const output = { key: 'light', index, intensity, poly, position, radius };
    return output;
  });

  // Draw the lights
  const canvas = createCanvas(pngRect.width * scale, pngRect.height * scale);
  const ctxt = /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d'));
  ctxt.globalCompositeOperation = 'destination-over';
  /**
   * `pngRect` is world bounds of geomorph (prior to later transform).
   * We must ensure top-left of canvas matches rect (x, y).
   */
  ctxt.setTransform(scale, 0, 0, scale, -scale * pngRect.x, -scale * pngRect.y);

  lights.forEach(({ position, radius, intensity, poly }) => {
    const gradient = ctxt.createRadialGradient(
      position.x, position.y, 0,
      position.x, position.y, 2 * radius,
    );
    gradient.addColorStop(0, `rgba(0, 0, 0, ${intensity})`);
    gradient.addColorStop(0.5, '#00000000');
    gradient.addColorStop(0.86, '#00000000');
    ctxt.fillStyle = gradient;
    fillPolygon(ctxt, [poly]);
  });

  /**
   * - Scale {geomorph}.png up by `scale`, assuming it is already scaled x2.
   * - Each geomorph has world bounds `pngRect` (prior to later transform),
   *   and we ensure canvas top-left corresponds to image top-left.
   */
  ctxt.setTransform(scale / 2, 0, 0, scale / 2, 0, 0);
  ctxt.globalCompositeOperation = 'source-in';
  const image = await loadImage(fs.readFileSync(path.resolve(geomorphPNGPath)));
  ctxt.drawImage(/** @type {*} */ (image), 0, 0);
  ctxt.globalCompositeOperation = 'destination-over';

  // // TEST
  // ctxt.strokeStyle = 'red';
  // ctxt.setTransform(scale, 0, 0, scale, -scale * pngRect.x, -scale * pngRect.y);
  // lights.forEach(({ poly }) => strokePolygon(ctxt, [poly]));

  await util.promisify(stream.pipeline)(
    canvas.createPNGStream(), 
    fs.createWriteStream(outputPath),
  );

})();
