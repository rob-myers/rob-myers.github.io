import { findNavPath } from './index';
import * as Geom from '@model/geom/geom.model';
import { rectsToPolyanya } from '@model/geom/polyanya.model';
import { geomService } from '@model/geom/geom.service';

console.log('Example 1', findNavPath(
  rectsToPolyanya([
    new Geom.Rect(0, 0, 25, 50),
    new Geom.Rect(25, 0, 25, 50),
    new Geom.Rect(50, 25, 50, 25),
  ]),
  { x: 0.1, y: 0.1 },
  { x: 99, y: 26 },
  true,
));

/**
 * TODO
 * 1. Work with delaunay triangulation.
 * 2. Reproduce problematic example (rects -> triangulation) and solve here.
 */

const src = { x: -160, y: 0 };
const dst = { x: -160, y: -40 };

const rects = [
  Geom.Rect.from({x: -200, y: -470, width: 400, height: 140}),
  Geom.Rect.from({x: -160, y: -560, width: 320, height: 90}),
  Geom.Rect.from({x: -70, y: -600, width: 140, height: 40}),
  Geom.Rect.from({x: -160, y: -330, width: 320, height: 90}),
  Geom.Rect.from({x: -70, y: -240, width: 140, height: 40}),
  Geom.Rect.from({x: -200, y: -70, width: 40, height: 140}),
  Geom.Rect.from({x: -160, y: -160, width: 80, height: 320}),
  Geom.Rect.from({x: -70, y: -200, width: 140, height: 40}),
  Geom.Rect.from({x: 80, y: -160, width: 80, height: 320}),
  Geom.Rect.from({x: 160, y: -70, width: 40, height: 140}),
  Geom.Rect.from({x: -80, y: -160, width: 160, height: 80}),
  Geom.Rect.from({x: -80, y: 80, width: 160, height: 80}),
];
const polys = geomService.union(rects.map(r => Geom.Polygon.fromRect(r)));
// TODO triangulate