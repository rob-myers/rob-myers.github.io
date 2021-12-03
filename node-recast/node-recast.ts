/// <reference path="../media/scripts/deps.d.ts"/>
import fs from 'fs';
import recast from '../recastCLI.js/build/Release/RecastCLI';

import { Vect, Poly } from '../projects/geom';
import { geomorphJsonPath } from '../projects/geomorph/geomorph.model';
import layoutDefs from '../projects/geomorph/layouts';
import { geom } from '../projects/service/geom';

const gmLayoutId = Number(process.argv[2]);
const layout = Object.values(layoutDefs).find(x => x.id === gmLayoutId);
if (!layout || !fs.existsSync(`../public/${geomorphJsonPath(layout.key)}`)) {
  throw Error(`Usage: \`yarn recast {geomorphId}\`\n\te.g. \`yarn recast 301\``);
}

/**
 * Output JSON list of GeoJSON polygons.
 * We do this because node-recast uses node version 10 (to get it working),
 * which is incompatible with our version.
 */
console.log(
  computeRecastNavmesh(layout.key)
);

export function computeRecastNavmesh(key: Geomorph.LayoutKey) {

  const gmContents = fs.readFileSync('../public/' + geomorphJsonPath(key)).toString();
  const json = JSON.parse(gmContents) as Geomorph.GeomorphJson;
  const navPoly = json.navPoly.map(x => Poly.from(x));
  const decomp = geom.polysToTriangulation(navPoly);
  
  const vs = new Float32Array(decomp.vs.reduce((agg, p) => agg.concat([p.x, 0, p.y]), [] as number[]));
  const ids = new Int32Array(decomp.tris.reduce((agg, triple) => agg.concat(triple.map(x => x + 1)), [] as number[]));
  recast.loadArray(vs, ids);
  
  const result = recast.build(
    // cellSize,
    1.5,
    // cellHeight,
    1,
    // agentHeight,
    1,
    // agentRadius,
    1,
    // agentMaxClimb,
    10,
    // agentMaxSlope,
    0,
    // regionMinSize
    30,
    // regionMergeSize
    2,
    // edgeMaxLen
    50,
    // edgeMaxError
    0,
    // vertsPerPoly
    3,
    // detailSampleDist
    10,
    // detailSampleMaxErro
    0,
  );
  
  const items = result.split('@').filter(Boolean);
  const outputVs = items.filter(x => x.startsWith('v')).map(x => x.slice(2).split(' ').map(Number)).map(([x,,y]) => new Vect(x, y));
  const outputIds = items.filter(x => x.startsWith('f')).map(x => x.slice(2).split(' ').map(x => Number(x) - 1)) as [number, number, number][];
  const polys = geom.triangulationToPolys({ vs: outputVs, tris: outputIds });

  return JSON.stringify(polys.map(poly => poly.geoJson));
}
