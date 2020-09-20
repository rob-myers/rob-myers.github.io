import { findNavPath, findNavPathAlt } from './index';
import * as Geom from '@model/geom/geom.model';
import Mesh from './structs/mesh';
import { rectsToPolyanya } from '@model/geom/polyanya.model';

/** See https://bitbucket.org/dharabor/pathfinding/src/d2ba41149c7a3c01a3e119cd31abb2874f439b83/anyangle/polyanya/meshes/tests/square.mesh?at=master */
console.log('Example 1', findNavPath(
  {
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
  },
  { x: 0.1, y: 0.1 },
  { x: -0.1, y: -0.1 },
  true,
));

console.log('Example 2', findNavPath(
  {
    vertices: [[0, 0], [10, 0], [10, 10], [0, 10]],
    polygons: [
      { vertexIds: [0, 1, 2, 3], adjPolyIds: [-1, -1, -1, -1] },
    ],
    vertexToPolys: [
      [-1, 0], [-1, 0], [-1, 0], [-1, 0],
    ],
  },
  { x: 0.1, y: 0.1 },
  { x: 0.9, y: 0.9 },
  true,
));

console.log('Example 3', findNavPath(
  {
    vertices: [
      [0, 0], // 0
      [3, 0],
      [7, 0],
      [10, 0],
      [10, 10],
      [7, 10],
      [3, 10],
      [0, 10], // 7
      [3, 3], // 8
      [7, 3],
      [7, 7],
      [3, 7], // 11
  
      [4, 4], // 12 
      [7, 4], // 13
      [7, 6], // 14
      [4, 6], // 15
    ],
    polygons: [
      { vertexIds: [1, 2, 9, 8], adjPolyIds: [3, -1, 1, -1] },
      // { vertexIds: [2, 3, 4, 5, 10, 9], adjPolyIds: [0, -1, -1, -1, 2, -1] },
      { vertexIds: [2, 3, 4, 5, 10, 14, 13, 9], adjPolyIds: [0, -1, -1, -1, 2, -1, 4, -1] },
      { vertexIds: [11, 10, 5, 6], adjPolyIds: [3, -1, 1, -1] },
      { vertexIds: [0, 1, 8, 11, 6, 7], adjPolyIds: [-1, -1, 0, -1, 2, -1] },
      { vertexIds: [12, 13, 14, 15], adjPolyIds: [-1, -1, 1, -1] },
    ],
    vertexToPolys: [
      [-1, 3],
      [-1, 0, 3],
      [-1, 1, 0],
      [-1, 1], // 3
      [-1, 1],
      [1, -1, 2],
      [2, -1, 3], // 6
      [3, -1],
      [0, -1, 3], // 8
      [1, -1, 0],
      [1, 2, -1],
      [2, 3, -1], // 11
  
      [4, -1], // 12
      [1, 4, -1], // 13
      [1, -1, 4], // 14
      [4, -1], // 15
    ],
  },
  { x: 0.1, y: 0.1 },
  { x: 5, y: 5 },
  true,
));

console.log('Example 4', findNavPath(
  rectsToPolyanya([
    new Geom.Rect(0, 0, 25, 50),
    new Geom.Rect(25, 0, 25, 50),
    new Geom.Rect(50, 25, 50, 25),
  ]),
  { x: 0.1, y: 0.1 },
  { x: 99, y: 26 },
  true,
));


console.log('Example 5', findNavPathAlt(
  new Mesh(
    rectsToPolyanya([
      new Geom.Rect(0, 0, 25, 50),
      new Geom.Rect(25, 0, 25, 50),
      new Geom.Rect(50, 25, 50, 25),
    ]),
  ),
  { x: 0.1, y: 0.1 },
  { x: 99, y: 26 },
  true,
));