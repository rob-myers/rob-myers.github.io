import * as poly2tri from 'poly2tri';
import * as polygonClipping from 'polygon-clipping';
import earcut from 'earcut';

import { Triple, Pair } from 'model/generic.model';
import { Vector, Coord, VectorJson, Edge } from "./vector.model";
import { Rect } from "./rect.model";

export class Polygon {

  constructor(
    public outline: Vector[] = [],
    public holes: Vector[][] = [],
  ) {}

  get allPoints(): Vector[] {
    return this.outline.concat(...this.holes);
  }

  /**
   * Ensure final point of each ring doesn't equal 1st point.
   * Such loops arise from npm module 'polygon-clipping',
   * but are unsupported by npm module 'poly2tri'.
   */
  cleanFinalReps() {
    for (const ring of [this.outline, ...this.holes]) {
      const last = ring.pop();
      if (last && !last.equals(ring[0])) {
        ring.push(last);
      }
    }
    return this;
  }

  clone() {
    const outline = this.outline.map(p => p.clone());
    const holes = this.holes.map(hole => hole.map(p => p.clone()));
    return new Polygon(outline, holes);
  }

  /**
   * Create a new inset or outset version of this polygon,
   * by cutting/unioning quads.
   * - assume outer points have anticlockwise orientation.
   * - assume holes have clockwise orientation.
   */
  createInset(amount: number) {
    if (amount === 0) {
      return [this.clone()];
    }

    // Compute 4-gons inset or outset along edge normals by `amount`
    const [outerQuads, ...holesQuads] = [
      {
        ring: this.outline,
        inset: Polygon.insetRing(this.outline, amount),
      },
      ...this.holes.map(ring => ({
        ring,
        inset: Polygon.insetRing(ring, amount),
      }))
    ].map(({ ring, inset }) =>
      ring.map(
        (_, i) =>
          new Polygon([
            ring[i].clone(),
            inset[i],
            inset[(i + 1) % ring.length],
            ring[(i + 1) % ring.length].clone()
          ])
      )
    );

    if (amount > 0) {// Inset
      return Polygon.cutOut(outerQuads.concat(...holesQuads), [this.clone()]);
    } // Otherwise we outset
    return Polygon.union([this.clone()].concat(outerQuads, ...holesQuads));
  }

  createOutset(amount: number) {
    return this.createInset(-amount);
  }

  /**
   * Cut `cuttingPolys` from `polys`.
   */
  private static cutOut(cuttingPolys: Polygon[], polys: Polygon[]): Polygon[] {
    return polygonClipping
      .difference(
        polys.map(({ geoJson: { coordinates } }) => coordinates),
        ...cuttingPolys.map(({ geoJson: { coordinates } }) => coordinates),
      )
      .map(coords => Polygon.from(coords).cleanFinalReps());
  }

  get edges() {
    return {
      outline: this.outline.map((p, i, ps) => new Edge(p, ps[(i + 1) % ps.length])),
      holes: this.holes.map(hole => hole.map((p, i, ps) => new Edge(p, ps[(i + 1) % ps.length]))),
    };
  }

  /**
   * Faster but less uniform.
   * Also cannot handle Steiner points.
   */
  fastTriangulate() {
    const { coordinates } = this.geoJson;
    const data = earcut.flatten(coordinates);
    const triIds = earcut(data.vertices, data.holes, 2);
    const indexTriples = triIds.reduce<Triple<number>[]>(
      (agg, vertexIndex, i) =>
        i % 3 === 2
          ? agg.concat([[triIds[i - 2], triIds[i - 1], vertexIndex]])
          : agg,
      [],
    );
    return { vs: this.allPoints, tris: indexTriples };
  }

  static from(input: Partial<PolygonJson> | GeoJsonPolygon['coordinates']) {
    if (input instanceof Array) {
      return new Polygon(
        input[0].map(([x, y]) => new Vector(x, y)),
        input.slice(1).map(hole => hole.map(([x, y]) => new Vector(x, y)))
      );
    }
    return new Polygon(
      (input.outline || []).map(p => Vector.from(p)),
      (input.holes || []).map(hole => hole.map(p => Vector.from(p))),
    );
  }

  static fromRect(rect: Rect) {
    return new Polygon(rect.points);
  }

  get geoJson(): GeoJsonPolygon {
    return {
      type: 'Polygon',
      coordinates: [this.outline.map<Coord>(({ x, y }) => [x, y])]
        .concat(this.holes.map(hole => hole.map(({ x, y }) => [x, y]))),
    };
  }

  /**
   * Compute intersection of two infinite lines i.e.
   * - `p0 + lambda * d0`.
   * - `p1 + lambda' * d1`.
   *
   * If they intersect return `lambda`, else `null`.
   */
  private static getLinesIntersection(
    p0: Vector,
    d0: Vector,
    p1: Vector,
    d1: Vector
  ): null | number {
    const d0x = d0.x,
      d0y = d0.y,
      p0x = p0.x,
      p0y = p0.y,
      d1x = d1.x,
      d1y = d1.y,
      p1x = p1.x,
      p1y = p1.y;
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

  /** Inset/outset a ring by {amount}. */
  private static insetRing(ring: Vector[], amount: number): Vector[] {
    const poly = new Polygon(ring);
    const tangents = poly.tangents.outer;
    const edges = ring.map<Pair<Vector>>((p, i) => [
      p.clone().translate(amount * -tangents[i].y, amount * tangents[i].x),
      ring[(i + 1) % ring.length].clone().translate(amount * -tangents[i].y, amount * tangents[i].x)
    ]);
    return edges.map((edge, i) => {
      const nextIndex = (i + 1) % edges.length;
      const nextEdge = edges[nextIndex];
      const lambda = Polygon.getLinesIntersection(
        edge[1],
        tangents[i],
        nextEdge[0],
        tangents[nextIndex]
      );
      return lambda
        ? edge[1].translate(lambda * tangents[i].x, lambda * tangents[i].y)
        : Vector.average([edge[1], nextEdge[0]]); // Fallback
    });
  }

  get json(): PolygonJson {
    return {
      outline: this.outline.map(({ x, y }) => ({ x, y })),
      holes: this.holes.map(hole => hole.map(({ x, y }) => ({ x, y }))),
    };
  }

  /**
   * Quality triangulation via constrained delaunay library 'poly2ti'.
   * Can fail for 'non-wellformed polygons' e.g. given square
   * with a hole, cut another hole meeting 1st hole at a point.
   * On failure we fallback to earcut algorithm, warning in console.
   */
  qualityTriangulate() {
    try {
      interface V2WithId extends VectorJson { id: number }
      const outline: V2WithId[] = this.outline.map(({ x, y }, id) => ({ x, y, id }));
      let nextId = outline.length;
      const holes: V2WithId[][] = this.holes
        .map(hole => hole.map(({ x, y }) => ({ x, y, id: nextId++ })));

      const tris = new poly2tri.SweepContext(outline)
        .addHoles(holes)
        // Seen failures, but cdt2d handles steiner points
        // .addPoints(this.steinerPoints)
        .triangulate()
        .getTriangles()
        .map(t => [t.getPoint(0), t.getPoint(1), t.getPoint(2)] as Triple<V2WithId>)
        .map<Triple<number>>(([u, v, w]) => [u.id, v.id, w.id]);
      
      return { vs: this.allPoints, tris };
    } catch (e) {
      console.error('Quality triangulation failed, falling back to earcut');
      console.error(e);
      return this.fastTriangulate();
    }
  }

  static pointInTriangle(pt: Vector, v1: Vector, v2: Vector, v3: Vector) {
    const d1 = Polygon.sign(pt, v1, v2);
    const d2 = Polygon.sign(pt, v2, v3);
    const d3 = Polygon.sign(pt, v3, v1);
    const hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0);
    const hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0);
    return !(hasNeg && hasPos);
  }

  get rect() {
    return Rect.fromPoints(...this.outline);
  }

  round() {
    this.outline.forEach(p => p.round());
    this.holes.forEach(h => h.forEach(p => p.round()));
    return this;
  }

  scale(scalar: number) {
    this.outline.forEach(p => p.scale(scalar));
    this.holes.forEach(h => h.forEach(p => p.scale(scalar)));
    return this;
  }

  private static sign (p1: Vector, p2: Vector, p3: Vector) {
    return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
  }

  /** Compute tangents of exterior and holes. */
  get tangents(): { outer: Vector[]; inner: Vector[][] } {
    const rings = [this.outline, ...this.holes];
    const [outer, ...inner] = rings.map(ring =>
      // Append first to get final tangent
      ring.concat(ring[0]).reduce(
        (agg, p, i, ps) =>
          i > 0
            ? agg.concat(
              p
                .clone()
                .sub(ps[i - 1])
                .normalize()
            )
            : [],
        [] as Vector[]
      )
    );
    return { outer, inner };
  }

  translate(delta: Vector) {
    this.outline.forEach(p => p.translate(delta.x, delta.y));
    this.holes.forEach(h => h.forEach(p => p.translate(delta.x, delta.y)));
    return this;
  }

  /** Construct union of _polygons_, yielding a multipolygon. */
  private static union(polys: Polygon[]): Polygon[] {
    return polygonClipping
      .union([], ...polys.map(({ geoJson: { coordinates } }) => coordinates))
      .map(coords => Polygon.from(coords).cleanFinalReps());
  }
  
}

export interface PolygonJson {
  outline: VectorJson[];
  holes: VectorJson[][];
}
export interface GeoJsonPolygon {
  type: 'Polygon';
  coordinates: Coord[][];
}