import { MeshJson } from "./structs/mesh";
import { ScenarioJson } from "./helpers/scenario";
import { main } from './scenario-runner';

// mesh
// 2
// 5 4  // 5 vertices, 4 polygons
// 0 1 3 -1 1 0  // (0,1) 3 nbors (-1, 1, 0)
// 1 0 3 -1 0 3  // (1,0)
// 0 -1 3 -1 3 2 // (0,-1)
// -1 0 3 -1 2 1 // (-1, 0)
// 0 0 4 0 1 2 3 // (0,0)
// 3 4 1 0 1 3 -1
// 3 4 0 3 2 0 -1
// 3 4 3 2 3 1 -1
// 3 4 2 1 0 2 -1
const meshEx1: MeshJson = {
  vertices: [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
    [0, 0],
  ],
  polygons: [
    { vertexIds: [4, 1, 0], adjPolyIds: [1, 3, -1] },
    { vertexIds: [4, 0, 3], adjPolyIds: [2, 0, -1] },
    { vertexIds: [4, 3, 2], adjPolyIds: [3, 1, -1] },
    { vertexIds: [4, 2, 1], adjPolyIds: [0, 2, -1] },
  ],
  vertexToPolys: [
    [-1, 1, 0],
    [-1, 0, 3],
    [-1, 3, 2],
    [-1, 2, 1],
    [0, 1, 2, 3],
  ],
};

// bucket, mapName, xsize, ysize, start.x, start.y, goal.x, goal.y, gridcost
// e.g. 0	maps/dao/arena.map	49	49	1	11	1	12	1
const scenEx1: ScenarioJson = {
  bucket: 0,
  xsize: 10,
  ysize: 10,
  start: { x: 0.1, y: 0.1 },
  goal: { x: -0.1, y: -0.1 },
  gridcost: 1,
};

// const meshEx1: MeshJson = {
//   vertices: [[0, 0], [0, 100], [100, 100], [100, 0]],
//   polygons: [{ vertexIds: [0, 1, 2, 3], adjPolyIds: [-1, -1, -1, -1] }],
//   vertexToPolys: [[-1, 0], [-1, 0], [-1, 0], [-1, 0]],
// };

main(meshEx1, [scenEx1], true);
