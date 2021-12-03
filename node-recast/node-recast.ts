/// <reference path="../media/scripts/deps.d.ts"/>
import fs from 'fs';
import recast from '../recastCLI.js/build/Release/RecastCLI';
//@ts-ignore

import { Poly } from '../projects/geom/poly';
import { geomorphJsonPath } from '../projects/geomorph/geomorph.model';
import { geom } from '../projects/service/geom';

const gmContents = fs.readFileSync('../public/' + geomorphJsonPath('g-301--bridge')).toString();
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
); // return string

const items = result.split('@').filter(Boolean);
const outputVs = items.filter(x => x.startsWith('v')).map(x => x.slice(2).split(' ').map(Number));
const outputIds = items.filter(x => x.startsWith('f')).map(x => x.slice(2).split(' ').map(x => Number(x) - 1));

console.log({
  outputVs,
  outputIds,
});
