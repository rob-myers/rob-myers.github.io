import { Vector, Coord, VectorJson, Edge } from "./vector.model";
import { Rect } from "./rect.model";

export class Polygon {

  constructor(
    public outline: Vector[] = [],
    public holes: Vector[][] = [],
  ) {}

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
  
}

export interface PolygonJson {
  outline: VectorJson[];
  holes: VectorJson[][];
}
export interface GeoJsonPolygon {
  type: 'Polygon';
  coordinates: Coord[][];
}
