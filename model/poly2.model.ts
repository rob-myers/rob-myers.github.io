import polygonClipping from 'polygon-clipping';
import earcut from 'earcut';
import * as poly2tri from 'poly2tri';
import cdt2d, { Cdt2dOptions } from 'cdt2d';

import { Rect2 } from './rect2.model';
import { Vector2, Coord } from './vec2.model';
import { chooseRandomItem } from './generic.model';

/**
 * A polygon with possibly many holes.
 */
export class Poly2 {

  public bounds!: Rect2;

  private cdt2dOpts: Cdt2dOptions = {
    delaunay: true,
    exterior: false,
    interior: true,
  };

  //#region cached
  private _svgPath?: string;
  private _triangulation?: Poly2[];
  /** Can be refined e.g. for better path-finding */
  private _customTriangulation?: Poly2[];
  //#endregion

  /** Ignoring holes. */
  public get center(): Vector2 {
    if (this.points.length) {
      return this.points
        .reduce((agg, point) => agg.add(point), Vector2.zero)
        .scale(1 / this.points.length);
    }
    return Vector2.zero;
  }

  /**
   * Assuming this is triangle, get its circum center.
   * Source https://bjornharrtell.github.io/jsts/doc/api/jsts_geom_Triangle.js.html
   */
  public get circumCenter(): Vector2 {
    const [{ x: ax, y: ay }, { x: bx, y: by }, { x: cx, y: cy }] = this.points;
    const denom = 2 * Poly2.det2d(ax, ay, bx, by);
    const numx = Poly2.det2d(ay, ax * ax + ay * ay, by, bx * bx + by * by);
    const numy = Poly2.det2d(ax, ax * ax + ay * ay, bx, bx * bx + by * by);
    return new Vector2(cx - numx / denom, cy + numy / denom);
  }

  /**
   * IN PROGRESS.
   * - 1st test: cdt2d in 2 passes using center.
   * - 2nd test: split tris with small min angle
   * - 3rd test: implement 'Chew's 2nd algorithm'
   */
  public get customTriangulation(): Poly2[] {
    if (this._customTriangulation) {
      return this._customTriangulation;
    }
    const { points: vs, edges: es } = this.planarLineGraph;
    const triangles = cdt2d(vs, es, this.cdt2dOpts)
      .map((triIds) => new Poly2(triIds.map(i => Vector2.from(vs[i]))));


    // TODO refine via extra point for each circumcenter.
    const centers = triangles.map(({ center }) => center);
    const extVs = vs.concat(centers.map(({ coord }) => coord));
    const triangles2 = cdt2d(extVs, es, this.cdt2dOpts)
      .map((triIds) => new Poly2(triIds.map(i => Vector2.from(extVs[i]))));

    return (this._customTriangulation = triangles2);
  }

  /**
   * Alternative triangulation: faster but less 'uniform'.
   */
  public get fastTriangulation(): Poly2[] {
    // Represent polygon as Geo-JSON polygon coords.
    const { coordinates } = this.geoJson;
    // Compute vertices and holes in {earcut}'s format.
    const data = earcut.flatten(coordinates);
    // Compute list of triangular indices, relative to {data.vertices}.
    const triangleIndices = earcut(data.vertices, data.holes, 2);
    // Unflatten indices.
    const indexTriples = triangleIndices.reduce<[number, number, number][]>(
      (agg, vertexIndex, index) =>
        index % 3 === 2
          ? agg.concat([[triangleIndices[index - 2], triangleIndices[index - 1], vertexIndex]])
          : agg,
      []
    );

    // Unflatten {data.vertices}, which has even length.
    const vertices = data.vertices.reduce<Vector2[]>(
      (agg, vertexIndex, index) =>
        index % 2 ? agg.concat(new Vector2(data.vertices[index - 1], vertexIndex)) : agg,
      []
    );
    // De-reference {triangleIndices}, whose length is divisible by 3.
    return indexTriples.map(([i, j, k]) => new Poly2([vertices[i], vertices[j], vertices[k]]));
  }

  public get geoJson(): GeoJsonPolygon {
    return {
      type: 'Polygon',
      coordinates: [this.points.map<[number, number]>(({ x, y }) => [x, y])].concat(
        this.holes.map(hole => hole.map<[number, number]>(({ x, y }) => [x, y]))
      )
    };
  }

  public get planarLineGraph(): Pslg {
    return Poly2.planarLineGraph(this);
  }

  public get randomPoint(): Vector2 {
    if (!this.points.length || !this.triangulation.length) {
      return Vector2.zero;
    }
    const {
      points: [a, b, c]
    } = chooseRandomItem(this.triangulation) as Poly2;
    return Poly2.getRandomPointInTriangle(a, b, c);
    // return a.clone();
  }

  /**
   * Additionally inset to get thin walls. (?)
   * Assume {outer} has opposite orientation to each hole in {holes}.
   */
  public get svgPath() {
    if (this._svgPath) {
      return this._svgPath;
    }
    // const points = Poly2.insetRing(this.points.map((p) => p.clone()), 2);

    const outer = this.points.length
      ? `M${this.points[0]}${this.points
        .slice(1)
        .map(v => ` L${v}`)
        .join('')} z`
      : '';

    const holes = this.holes
      // .map((hole) => Poly2.insetRing(hole.map((p) => p.clone()), 2))
      .map(
        hole =>
          `M${hole[0]}${hole
            .slice(1)
            .map(v => ` L${v}`)
            .join('')} z`
      );

    return (this._svgPath = `${outer} ${holes.join(' ')}`);
  }

  /** Compute tangents of exterior and holes. */
  public get tangents(): {
    outer: Vector2[];
    inner: Vector2[][];
    } {
    const rings = [this.points, ...this.holes];
    const [outer, ...inner] = rings.map(ring =>
      // Append first to get final tangent.
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
        [] as Vector2[]
      )
    );
    return { outer, inner };
  }

  /**
   * Quality triangulation via constrained delaunay.
   * Can fail for 'non-wellformed polygons' e.g. given square
   * with a hole, cut another hole meeting 1st hole at a point.
   * On failure we fallback to earcut algorithm, warning in console.
   */
  public get triangulation(): Poly2[] {
    if (this._triangulation) {
      return this._triangulation;
    }
    try {
      const qualityTriangulation = new poly2tri.SweepContext(
        this.points.map(p => new poly2tri.Point(p.x, p.y))
      )
        .addHoles(this.holes.map(hole => hole.map(p => new poly2tri.Point(p.x, p.y))))
        .triangulate()
        .getTriangles()
        .map<Poly2>(
          t =>
            new Poly2([
              Vector2.from(t.getPoint(0)),
              Vector2.from(t.getPoint(1)),
              Vector2.from(t.getPoint(2))
            ])
        );
      return (this._triangulation = qualityTriangulation);
    } catch (e) {
      console.error('Quality triangulation failed, falling back to earcut.');
      console.error(e);
      return (this._triangulation = this.fastTriangulation);
    }
  }

  constructor(
    public points: Vector2[] = [],
    public holes: Vector2[][] = [],
  ) {
    this.clearCache();
  }

  /**
   * Ensure the final point of each ring does not equal 1st point.
   * Such loops arise from npm module 'polygon-clipping',
   * but are unsupported by npm module 'poly2tri'.
   */
  public cleanFinalReps(): Poly2 {
    for (const ring of [this.points, ...this.holes]) {
      const last = ring.pop();
      if (last && !last.equals(ring[0])) {
        ring.push(last);
      }
    }
    return this;
  }

  private clearCache() {
    this._svgPath = undefined;
    this._triangulation = undefined;
    this._customTriangulation = undefined;
    this.bounds = Rect2.from(...this.points);
  }

  /**
   * Clone this polygon.
   */
  public clone() {
    const points = this.points.map(p => p.clone());
    const holes = this.holes.map(hole => hole.map(p => p.clone()));
    return new Poly2(points, holes);
  }

  /**
   * Does this polygon contain {point}?
   */
  public contains(point: Vector2) {
    if (!this.bounds.contains(point)) {
      return false;
    }
    // Does any triangle in triangulation contain point?
    return this.triangulation
      .map(({ points }) => points)
      .some(([u, v, w]) => Poly2.isPointInTriangle(point, u, v, w));
  }

  /**
   * Create a new inset/outset version of this polygon,
   * by cutting/unioning quads.
   * - Assume outer points have anticlockwise orientation,
   * - Assume holes have clockwise orientation.
   */
  public createInset(amount: number): Poly2[] {
    if (amount === 0) {
      return [this.clone()];
    }

    // Compute 4-gons inset or outset along edge normals by {amount}.
    const [outerQuads, ...holesQuads] = [
      {
        ring: this.points,
        inset: Poly2.insetRing(this.points, amount)
      },
      ...this.holes.map(ring => ({
        ring,
        inset: Poly2.insetRing(ring, amount)
      }))
    ].map(({ ring, inset }) =>
      ring.map(
        (_, i) =>
          new Poly2([
            ring[i].clone(),
            inset[i],
            inset[(i + 1) % ring.length],
            ring[(i + 1) % ring.length].clone()
          ])
      )
    );

    if (amount > 0) {
      // Inset.
      return Poly2.cutOut(outerQuads.concat(...holesQuads), [this.clone()]);
    } // Outset
    return Poly2.union([this.clone()].concat(outerQuads, ...holesQuads));
  }

  public createOutset(amount: number) {
    return this.createInset(-amount);
  }

  /**
   * Cut {cuttingPolys} from {polys}.
   */
  public static cutOut(cuttingPolys: Poly2[], polys: Poly2[]): Poly2[] {
    return polygonClipping
      .difference(
        polys.map(({ geoJson: { coordinates } }) => coordinates),
        ...cuttingPolys.map(({ geoJson: { coordinates } }) => coordinates)
      )
      .map(coords => Poly2.from(coords).cleanFinalReps());
  }

  private static det2d(a: number, b: number, c: number, d: number) {
    return a * d - b * c;
  }
  

  public static from(input: [number, number][][] | GeoJsonPolygon): Poly2 {
    if (Array.isArray(input)) {
      const coordinates = input;
      return new Poly2(
        coordinates[0].map(([x, y]) => new Vector2(x, y)),
        coordinates.slice(1).map(hole => hole.map(([x, y]) => new Vector2(x, y)))
      );
    } else {
      const { coordinates } = input;
      return new Poly2(
        coordinates[0].map(([x, y]) => new Vector2(x, y)),
        coordinates.slice(1).map(hole => hole.map(([x, y]) => new Vector2(x, y)))
      );
    }
  }

  /**
   * Compute intersection of two infinite lines i.e.
   * p0 + lambda * d0 and p1 + lambda' * d1.
   * If intersects return a respective lambda, else null.
   */
  public static getLinesIntersection(
    p0: Vector2,
    d0: Vector2,
    p1: Vector2,
    d1: Vector2
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

  /**
   * https://math.stackexchange.com/q/18686/61649
   * (1 - Math.sqrt(r1)).a + (Math.sqrt(r1) * (1 - r2)).b + (r2 * Math.sqrt(r1)).c
   */
  public static getRandomPointInTriangle(a: Vector2, b: Vector2, c: Vector2) {
    const [r1, r2] = [Math.random(), Math.random()];
    return a
      .clone()
      .scale(1 - Math.sqrt(r1))
      .add(b.clone().scale(Math.sqrt(r1) * (1 - r2)))
      .add(c.clone().scale(r2 * Math.sqrt(r1)));
  }

  /**
   * Is {pt} in triangle {v1}, {v2}, {v3}?
   * https://stackoverflow.com/a/2049593/2917822
   */
  public static isPointInTriangle(pt: Vector2, v1: Vector2, v2: Vector2, v3: Vector2) {
    const d1 = Poly2.sign(pt, v1, v2);
    const d2 = Poly2.sign(pt, v2, v3);
    const d3 = Poly2.sign(pt, v3, v1);

    const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
    const hasPos = d1 > 0 || d2 > 0 || d3 > 0;

    return !(hasNeg && hasPos);
  }

  /**
   * Inset/outset a ring by {amount}.
   */
  public static insetRing(ring: Vector2[], amount: number): Vector2[] {
    const poly = new Poly2(ring);
    const tangents = poly.tangents.outer;
    const edges = ring.map<[Vector2, Vector2]>((p, i) => [
      p.clone().translate(amount * -tangents[i].y, amount * tangents[i].x),
      ring[(i + 1) % ring.length].clone().translate(amount * -tangents[i].y, amount * tangents[i].x)
    ]);
    return edges.map((edge, i) => {
      const nextIndex = (i + 1) % edges.length;
      const nextEdge = edges[nextIndex];
      const lambda = Poly2.getLinesIntersection(
        edge[1],
        tangents[i],
        nextEdge[0],
        tangents[nextIndex]
      );
      return lambda
        ? edge[1].translate(lambda * tangents[i].x, lambda * tangents[i].y)
        : Vector2.average([edge[1], nextEdge[0]]); // Fallback.
    });
  }

  /**
   * Construct intersection of _1 or more multipolygons_,
   * yielding a multipolygon. For example, `rest` could be
   * the stage's polygons, viewed as a single multipolygon.
   */
  public static intersect(first: Poly2[], ...rest: Poly2[][]): Poly2[] {
    return polygonClipping
      .intersection(
        first.map(({ geoJson: { coordinates } }) => coordinates),
        ...rest.map(poly => poly.map(({ geoJson: { coordinates } }) => coordinates))
      )
      .map(coords => Poly2.from(coords).cleanFinalReps());
  }

  /**
   * Mutates this polygon.
   */
  public offset(delta: Vector2): this {
    this.points.forEach(p => p.add(delta));
    this.holes.forEach(hole => hole.forEach(p => p.add(delta)));
    this.clearCache();
    return this;
  }

  public static planarLineGraph(...polys: Poly2[]): Pslg {
    return [
      ...polys.map(({ points }) => points),
      ...polys.reduce((agg, { holes }) => agg.concat(holes), [] as Vector2[][]),
    ].reduce(
      (agg, loop) => {
        if (loop.length < 2) return agg;
        const offset = agg.points.length;
        return {
          points: agg.points.concat(loop.map(({ x, y }) => [x, y])),
          edges: agg.edges.concat(loop.map((_, i) => [offset+i, offset+(i+1)%loop.length])),
        };
      },
      { points: [], edges: [] } as Pslg
    );
  }

  /**
   * Reflect through horizontal axis,
   * i.e. the line y = {y}.
   */
  public reflectHorizontal(y: number) {
    this.points.forEach(p => (p.y = y + (y - p.y)));
    this.holes.forEach(hole => hole.forEach(p => (p.y = y + (y - p.y))));
    this.clearCache();
  }

  /**
   * Reflect through vertical axis,
   * i.e. the line x = {x}.
   */
  public reflectVertical(x: number) {
    this.points.forEach(p => (p.x = x + (x - p.x)));
    this.holes.forEach(hole => hole.forEach(p => (p.x = x + (x - p.x))));
    this.clearCache();
  }

  public removeHoles(): Poly2 {
    if (this.holes.length) {
      this.holes = [];
      this.clearCache();
    }
    return this;
  }

  private static sign(p1: Vector2, p2: Vector2, p3: Vector2) {
    return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
  }

  public translate(dx: number, dy: number): this {
    return this.offset(new Vector2(dx, dy));
  }

  /**
   * Construct union of _polygons_, yielding a multipolygon.
   */
  public static union(polys: Poly2[]): Poly2[] {
    return polygonClipping
      .union([], ...polys.map(({ geoJson: { coordinates } }) => coordinates))
      .map(coords => Poly2.from(coords).cleanFinalReps());
  }
}

export interface GeoJsonPolygon {
  type: 'Polygon';
  /** First are points, rest are holes. */
  coordinates: [number, number][][];
}

export interface GeoJsonFeature {
  type: 'Feature';
  geometry: GeoJsonPolygon;
}

/** Planar straight line graph. */
interface Pslg {
  /** Coords. */
  points: Coord[];
  /** Pairs of point indices. */
  edges: Coord[];
}
