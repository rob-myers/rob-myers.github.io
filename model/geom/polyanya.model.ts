import { Vector } from './vector.model';
import { Rect } from './rect.model';
import { RectNavGraph } from './rect-nav.model';
import { MeshJson as PolyanyaMeshJson } from '../polyanya/structs/mesh';

/**
 * Given rects only overlapping along edges, create a Polyanya mesh.
 */
export function rectsToPolyanya(rects: Rect[]): PolyanyaMeshJson {
  // Compute adjacency graph of rectangles via their intersections
  const { succ, toPolygon } = (new RectNavGraph(rects)).compute();

  /**
   * Each rect has a respective polygon `toPolygon.get(rect)` i.e. the rect and
   * all incident corners of other rects. Given a serialized polygon edge, we
   * provide its adjacent rects (1 or more).
   */
  const edgeToRects = rects.reduce<Record<string, Rect[]>>((agg, rect) => {
    const { all } = succ.get(rect)!;
    const { edges } = toPolygon.get(rect)!;
    edges.outline.forEach((edge) =>
      agg[`${edge}`] = [rect].concat(all.filter(r => r.contains(edge.midpoint))));
    return agg;
  }, {});

  const vertexKeys = Array.from(new Set(
    rects.flatMap(rect => rect.points.flatMap(p => `${p}`))
  ));

  /**
   * Each rect has a respective polygon i.e. rect & incident corners of other rects
   */
  const polygons: PolyanyaMeshJson['polygons'] = rects.map(rect => {
    const { outline, edges, outline: { length } } = toPolygon.get(rect)!;
    return {
      vertexIds: outline.map(x => vertexKeys.indexOf(`${x}`)),
      adjPolyIds: edges.outline
        .map((_, i, es) => es[(i - 1 + length) % length]) // Per polyanya convention
        .map((edge) => edgeToRects[`${edge}`].filter(r => r !== rect))
        .map(rs => !rs.length ? -1 : rects.indexOf(rs[0])),
    };
  });

  return {
    vertices: vertexKeys.map(x => Vector.from(x).coord),
    polygons,
    /**
     * We don't try to 'order' the polygons adjacent to the vertex, see:
     * https://bitbucket.org/dharabor/pathfinding/src/d2ba41149c7a3c01a3e119cd31abb2874f439b83/anyangle/polyanya/utils/spec/mesh/2.txt?at=master
     */
    vertexToPolys: vertexKeys.map((vKey) =>
      Object.keys(edgeToRects).filter(x => x.startsWith(`${vKey} `))
        .flatMap(edgeKey => {
          const adjRects = edgeToRects[edgeKey];
          return adjRects.length === 1 ? [rects.indexOf(adjRects[0]), -1] : adjRects.map(r => rects.indexOf(r))
        }).filter((x, i, xs) => i === xs.indexOf(x)), // Remove dups
    ),
  };
}