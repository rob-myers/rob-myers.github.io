import polygonClipping from 'polygon-clipping';
import rectDecompose from 'rectangle-decomposition';
import maximalMatching from 'bipartite-matching';
import minimalVertexCover from 'bipartite-vertex-cover';
import maximalIndependentSet from 'maximal-independent-set';

import * as Geom from '@model/geom/geom.model';
import { MeshJson as PolyanyaMeshJson } from '../polyanya/structs/mesh';

export default class GeomService {

  /** Multipolygon must be rectilinear with integer-valued coords. */
  private computeIntegerRectPartition({ outline, holes }: Geom.Polygon): Geom.Rect[] {
    const loops = [outline].concat(holes)
      .map((loop) => loop.map(({ x, y }) => [x, y] as [number, number]));

    const rects = rectDecompose(loops).map(([[x1, y1], [x2, y2]]) =>
      new Geom.Rect(x1, y1, x2 - x1, y2 - y1));

    return rects;
  }

  /** Rationalised poly must be rectilinear. */
  computeRectPartition(poly: Geom.Polygon, decimalPlaces = 3) {
    const scalar = Math.pow(10, decimalPlaces);
    const navPoly = poly.clone().scale(scalar).round();
    const navPartition = this.computeIntegerRectPartition(navPoly);
    return navPartition.map(rt => rt.scale(1 / scalar));
  }

  computeTangents(ring: Geom.Vector[]) {
    // We concat `ring[0]` for final tangent
    return ring.concat(ring[0]).reduce(
      (agg, p, i, ps) =>
        i > 0
          ? agg.concat(p.clone().translate(-ps[i - 1].x, -ps[i - 1].y).normalize())
          : [],
        [] as Geom.Vector[],
    );
  }

  /**
   * Cut `cuttingPolys` out of `polys`.
   */
  cutOut(cuttingPolys: Geom.Polygon[], polys: Geom.Polygon[]): Geom.Polygon[] {
    return polygonClipping
      .difference(
        polys.map(({ geoJson: { coordinates } }) => coordinates),
        ...cuttingPolys.map(({ geoJson: { coordinates } }) => coordinates),
      )
      .map(coords => Geom.Polygon.from(coords).cleanFinalReps());
  }

  /**
   * Compute intersection of two infinite lines i.e.
   * `p0 + lambda_0 * d0` and `p1 + lambda_1 * d1`.
   * If intersect return `lambda_0`, else `null`.
   */
  getLinesIntersection(
    p0: Geom.VectorJson,
    d0: Geom.VectorJson,
    p1: Geom.VectorJson,
    d1: Geom.VectorJson,
  ): null | number {
    const d0x = d0.x, d0y = d0.y,
      p0x = p0.x, p0y = p0.y,
      d1x = d1.x, d1y = d1.y,
      p1x = p1.x, p1y = p1.y;
    /**
     * Recall that normal_0 is (-d0y, d0x).
     * No intersection if the directions d0, d1 are approx. parallel,
     * ignoring colinear case.
     */
    if (Math.abs(-d0y * d1x + d0x * d1y) < 0.0001) {
      return null;
    }
    return (d1x * (p1y - p0y) - d1y * (p1x - p0x)) / (d0y * d1x - d1y * d0x);
  }

  getMaximalIndependentSet(graph: Geom.BipartiteGraph) {
    return maximalIndependentSet(graph.n, graph.m, graph.edges);
  }

  getMaximalMatching(graph: Geom.BipartiteGraph) {
    return maximalMatching(graph.n, graph.m, graph.edges);
  }

  getMinimalVertexCover(graph: Geom.BipartiteGraph) {
    return minimalVertexCover(graph.n, graph.m, graph.edges);
  }

  /** Assume `poly` is an island and all edges are segments */
  inset(poly: Geom.Polygon, amount: number): Geom.Polygon[] {
    if (amount === 0) {
      return [poly.clone()];
    }

    // Compute 4-gons inset along edge normals by amount
    const [outerQuads, ...holesQuads] = [
      { ring: poly.outline, inset: this.insetRing(poly.outline, amount) },
      ...poly.holes.map(ring => ({ ring, inset: this.insetRing(ring, amount) })),
    ].map(({ ring, inset }) => ring.map((_, i) =>
      new Geom.Polygon([
        ring[i].clone(),
        inset[i],
        inset[(i + 1) % ring.length],
        ring[(i + 1) % ring.length].clone(),
      ])
    ));

    if (amount > 0) {// Inset
      return this.cutOut(outerQuads.concat(...holesQuads), [poly.clone()]);
    } // Outset
    return this.union([poly.clone()].concat(outerQuads, ...holesQuads));
  }

  /** Inset a ring by `amount`. */
  insetRing(ring: Geom.Vector[], amount: number): Geom.Vector[] {
    /** Tangents */
    const ts = this.computeTangents(ring);

    const length = ring.length;
    /** Edges of ring translated along their normal by `amount` */
    const offsetEdges = ring.map<[Geom.Vector, Geom.Vector]>((v, i) => [
      v.clone().translate(amount * -ts[i].y, amount * ts[i].x),
      ring[(i + 1) % length].clone().translate(amount * -ts[i].y, amount * ts[i].x),
    ]);
    
    const outsetEdges = offsetEdges.map((edge, i) => {
      const nextIndex = (i + 1) % length;
      const nextEdge = offsetEdges[nextIndex];
      const lambda = this.getLinesIntersection(
        edge[1],
        ts[i],
        nextEdge[0],
        ts[nextIndex],
      );
      return lambda
        ? edge[1].translate(lambda * ts[i].x, lambda * ts[i].y)
        : Geom.Vector.average([edge[1], nextEdge[0]]); // Fallback
    });

    return outsetEdges;
  }

  /**
   * Project a GLTF vector onto xy plane, restricting precision.
   * We're assume z-axis corresponds to negative y-axis in 2d.
   */
  projectGltf(v: THREE.Vector3): Geom.Vector {
    return new Geom.Vector(v.x, -v.z).precision();
  }

  project(v: THREE.Vector3): Geom.Vector {
    return new Geom.Vector(v.x, v.y).precision(2);
  }

  outset(poly: Geom.Polygon, amount: number) {
    return this.inset(poly, -amount);
  }

  randomBipartiteGraph(n: number, m: number, p: number) {
    return {
        n,
        m,
        edges: [...Array(n)].reduce((agg, _, i) =>
          agg.concat(...[...Array(m)].map((_, j) => Math.random() < p ? [[i, j]] : []))
        , [] as Geom.BipartiteEdge[]),
    };
  }

  /** https://schteppe.github.io/p2.js/docs/files/src_collision_AABB.js.html */
  rayAabbIntersect(src: Geom.VectorJson, dir: Geom.VectorJson, rect: Geom.Rect){
    const t1 = (rect.x - src.x) / dir.x;
    const t2 = (rect.e - src.x) / dir.x;
    const t3 = (rect.y - src.y) / dir.y;
    const t4 = (rect.s - src.y) / dir.y;
    const tmin = Math.max(Math.max(Math.min(t1, t2), Math.min(t3, t4)));
    const tmax = Math.min(Math.min(Math.max(t1, t2), Math.max(t3, t4)));

    if (tmax < 0){// line intersects AABB, but whole AABB is behind us
      return -1;
    }
    if (tmin > tmax){// ray doesn't intersect AABB
      return -1;
    }
    return { x: src.x + dir.x * tmax, y: src.y + dir.y * tmax };
  }

  rayLeaveAabbIntersect(src: Geom.VectorJson, dir: Geom.VectorJson, rect: Geom.Rect) {
    const t1 = (rect.x - src.x) / dir.x;
    const t2 = (rect.e - src.x) / dir.x;
    const t3 = (rect.y - src.y) / dir.y;
    const t4 = (rect.s - src.y) / dir.y;
    const tmax = Math.min(Math.min(Math.max(t1, t2), Math.max(t3, t4)));
    return { x: src.x + dir.x * tmax, y: src.y + dir.y * tmax };
  }

  /**
   * Given a list of rects which may only overlap along edges,
   * create a Polyanya mesh.
   */
  rectsToPolyanya(rects: Geom.Rect[]): PolyanyaMeshJson {
    // Compute adjacency graph of rectangles via their intersections
    const { succ, toPolygon } = (new Geom.RectNavGraph(rects)).compute();

    /** Vertex key to list of rects it touches */
    const vertexToRects = rects.reduce<Record<string, Geom.Rect[]>>((agg, rect) => ({
      ...agg,
      ...rect.points.reduce<Record<string, Geom.Rect[]>>((agg, p) => ({
        ...agg,
        [`${p}`]: agg[`${p}`] || [rect].concat(succ.get(rect)!.all.filter(r => r.contains(p))),
      }), {}),
    }), {});
    const vertexKeys = Object.keys(vertexToRects);

    /**
     * Each rect has a respective polygon `toPolygon.get(rect)` i.e. the rect and
     * all incident corners of other rects. Given a serialized polygon edge, we
     * provide its adjacent rects (1 or more).
     */
    const edgeToRects = rects.reduce<Record<string, Geom.Rect[]>>((agg, rect) => {
      const { all } = succ.get(rect)!;
      const { edges } = toPolygon.get(rect)!;
      edges.outline.forEach((edge) =>
        agg[`${edge}`] = [rect].concat(all.filter(r => r.contains(edge.midpoint))));
      return agg;
    }, {});

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
      vertices: vertexKeys.map(x => Geom.Vector.from(x).coord),
      polygons,
      /**
       * We don't try to 'order' the polygons adjacent to the vertex, see:
       * https://bitbucket.org/dharabor/pathfinding/src/d2ba41149c7a3c01a3e119cd31abb2874f439b83/anyangle/polyanya/utils/spec/mesh/2.txt?at=master
       */
      vertexToPolys: vertexKeys.map((vKey) =>
        Object.keys(edgeToRects).filter(x => x.startsWith(`${vKey} `))
          .flatMap(edgeKey => {
            const adjRects = edgeToRects[edgeKey];
            return adjRects.length === 1
              ? [rects.indexOf(adjRects[0]), -1]
              : adjRects.map(r => rects.indexOf(r))
          }).filter((x, i, xs) => i === xs.indexOf(x)),
      ),
    };
  }

  union(polys: Geom.Polygon[]): Geom.Polygon[] {
    return polygonClipping
      .union([], ...polys.map(({ geoJson: { coordinates } }) => coordinates))
      .map(coords => Geom.Polygon.from(coords).cleanFinalReps());
  }

}
