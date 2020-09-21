import * as poly2tri from 'poly2tri';
import earcut from 'earcut';
import { Vector, Coord, VectorJson, Edge } from "./vector.model";
import { Rect } from "./rect.model";
import { Triple } from '@model/generic.model';

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
  public cleanFinalReps() {
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
  public fastTriangulate() {
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

    const triangleIds = indexTriples;
    const triangles = this.triangleIdsToPolys(triangleIds);

    return { triangleIds, triangles };
  }

  static from(input: PolygonJson | GeoJsonPolygon['coordinates']) {
    if (input instanceof Array) {
      return new Polygon(
        input[0].map(([x, y]) => new Vector(x, y)),
        input.slice(1).map(hole => hole.map(([x, y]) => new Vector(x, y)))
      );
    }
    return new Polygon(
      input.outline.map(p => Vector.from(p)),
      input.holes.map(hole => hole.map(p => Vector.from(p))),
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
  public qualityTriangulate() {
    try {
      interface V2WithId extends VectorJson { id: number }
      const outline: V2WithId[] = this.outline.map(({ x, y }, id) => ({ x, y, id }));
      let nextId = outline.length;
      const holes: V2WithId[][] = this.holes
        .map(hole => hole.map(({ x, y }) => ({ x, y, id: nextId++ })));

      const triangleIds = new poly2tri.SweepContext(outline)
        .addHoles(holes)
        // Seen failures, but cdt2d handles steiner points
        // .addPoints(this.steinerPoints)
        .triangulate()
        .getTriangles()
        .map(t => [t.getPoint(0), t.getPoint(1), t.getPoint(2)] as Triple<V2WithId>)
        .map<Triple<number>>(([u, v, w]) => [u.id, v.id, w.id]);
      
      const triangles = this.triangleIdsToPolys(triangleIds);

      return { triangles, triangleIds };
    } catch (e) {
      console.error('Quality triangulation failed, falling back to earcut');
      console.error(e);
      return this.fastTriangulate();
    }
  }

  public get rect() {
    return Rect.fromPoints(...this.outline);
  }

  public round() {
    this.outline.forEach(p => p.round());
    this.holes.forEach(h => h.forEach(p => p.round()));
    return this;
  }

  public scale(scalar: number) {
    this.outline.forEach(p => p.scale(scalar));
    this.holes.forEach(h => h.forEach(p => p.scale(scalar)));
    return this;
  }

  public translate(delta: Vector) {
    this.outline.forEach(p => p.translate(delta.x, delta.y));
    this.holes.forEach(h => h.forEach(p => p.translate(delta.x, delta.y)));
    return this;
  }

  private triangleIdsToPolys(triIds: Triple<number>[]): Polygon[] {
    const ps = this.allPoints;
    return triIds.map(([u, v, w]) => new Polygon([ ps[u], ps[v], ps[w] ]));
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
