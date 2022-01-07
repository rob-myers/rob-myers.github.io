/**
 * - Usage:
 *   - `yarn render-layout 301`
 *   - `yarn render-layout 301 --debug`
 *   - `yarn render-layout 101 --debug --scale=4`
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
import layoutDefs from '../../projects/geomorph/layouts';
import { createLayout, deserializeSvgJson } from '../../projects/service/geomorph';
import { renderGeomorph } from '../../projects/geomorph/render';
import { geom } from '../../projects/service/geom';
import { triangle } from '../../projects/service/triangle';

const geomorphId = Number(process.argv[2]);
const layoutDef = Object.values(layoutDefs).find(x => x.id === geomorphId);
if (!layoutDef) {
  console.error(`No geomorph found with id "${geomorphId}"`);
  process.exit(1);
}

const opts = getOpts(process.argv);
const [debug, scale] = [opts.debug, opts.scale];
const defaultScale = 2;

const publicDir = path.resolve(__dirname, '../../public');
const outputDir = path.resolve(publicDir, 'geomorph');
const outputPath =  path.resolve(outputDir, `${layoutDef.key}${debug ? '.debug.png' : '.png'}`);

(async function run() {
  const pipeline = util.promisify(stream.pipeline);
  const { layout, canvas } = await renderLayout(layoutDef);

  /** @type {Geomorph.GeomorphJson} */
  const json = {
    key: layout.def.key,
    id: layout.def.id,
    pngRect: layout.items[0].pngRect,
    doors: layout.groups.singles
      .filter(x => x.tags.includes('door'))
      .map(({ poly, tags }) => {
        const { angle, rect } = geom.polyToAngledRect(poly);
        const [u, v] = geom.getAngledRectSeg({ angle, rect });
        return { angle, rect: rect.json, poly: poly.geoJson, tags, seg: [u.json, v.json] };
      }),
    hull: {
      poly: layout.hullPoly.map(x => x.geoJson),
    },
    labels: layout.labels,
    navPoly: layout.navPoly.map(x => x.geoJson),
    navDecomp: layout.navDecomp,
    obstacles: layout.groups.obstacles.map(poly => poly.geoJson),
    walls: layout.walls.map(x => x.geoJson),
  };

  fs.writeFileSync(path.resolve(outputDir, `${layoutDef.key}.json`), stringify(json));

  await pipeline(
    canvas.createPNGStream(), 
    fs.createWriteStream(outputPath),
  );
})();

/** @type {Geomorph.RenderOpts} */
const renderOpts = {
  scale: scale || defaultScale,
  obsBounds: true, wallBounds: true, navTris: true,
  ...debug && { doors: true, labels: true }
};

/**
 * Compute and render layout, given layout definition.
 * @param {Geomorph.LayoutDef} def
 */
async function renderLayout(def) {

  const canvas = createCanvas(0, 0);
  const symbolLookup = deserializeSvgJson(/** @type {*} */ (svgJson));
  const layout = await createLayout(def, symbolLookup, triangle);

  await renderGeomorph(
    layout,
    symbolLookup,
    canvas,
    (pngHref) => loadImage(fs.readFileSync(path.resolve(publicDir + pngHref))),
    renderOpts,
  );
  return {
    layout,
    canvas,
  };
}
