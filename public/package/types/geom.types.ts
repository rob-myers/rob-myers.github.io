// Used by @store/geom.duck.ts and monaco-editor at runtime.

/**
 * Used by @store/geom.duck and also `useSelector` at runtime.
 */
export interface State {}

/**
 * Must keep in sync with `Act` from @store/geom.duck.
 * Used by `useDispatch` at runtime.
 */
export type DispatchableSync = never;

/**
 * Must keep in sync with `Thunk` from @store/geom.duck.
 * Used by `useDispatch` at runtime.
 */
export type DispatchableThunk = (
  | { type: '[geom] decompose as rects'; args: PolygonJson; returns: Rect[] }
  | { type: '[geom] inset polygon'; args: { poly: PolygonJson; amount: number }; returns: Polygon }
);

export class Vector {

  constructor(
    public x: number,
    public y: number,
  ) {}

  static average(vectors: Vector[]) {
    return vectors.length
      ? vectors
        .reduce((agg, v) => agg.translate(v.x, v.y), Vector.zero)
        .scale(1 / vectors.length)
      : Vector.zero;
  }

  clone() {
    return new Vector(this.x, this.y);
  }

  get coord(): [number, number] {
    return [this.x, this.y];
  }

  equals({ x, y }: Vector) {
    return this.x === x && this.y === y;
  }

  static from(p: VectorJson | string) {
    return typeof p === 'string'
      // expect e.g. 4.5,3
      ? new Vector(...(p.split(',').map(Number) as [number, number]))
      : new Vector(p.x, p.y);
  }

  get length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize(newLength = 1) {
    if (this.length) {
      return this.scale(newLength / this.length);
    }
    console.error(`Failed to normalize Vector '${this}' to length '${newLength}'`);
    return this;
  }

  scale(amount: number) {
    this.x *= amount;
    this.y *= amount;
    return this;
  }

  toString() {
    return `${this.x},${this.y}`;
  }

  translate(dx: number, dy: number): Vector {
    this.x += dx;
    this.y += dy;
    return this;
  }

  static get zero() {
    return new Vector(0, 0);
  }
}
export type Coord = [number, number];

export interface VectorJson {
  x: number;
  y: number;
}

export class Rect {

  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number,
  ) {}

  get points(): [Vector, Vector, Vector, Vector] {
    return [
      new Vector(this.x, this.y),
      new Vector(this.x + this.width, this.y),
      new Vector(this.x + this.width, this.y + this.height),
      new Vector(this.x, this.y + this.height),
    ];
  }

  get edges(): [[Vector, Vector], [Vector, Vector], [Vector, Vector], [Vector, Vector]] {
    const [p, q, r, s] = this.points;
    return [
      [p, q],
      [q, r],
      [r, s],
      [s, p],
    ];
  }

}

export interface RectJson {
  x: number;
  y: number;
  width: number;
  height: number;
}

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

  get geoJson(): GeoJsonPolygon {
    return {
      type: 'Polygon',
      coordinates: [this.outline.map<Coord>(({ x, y }) => [x, y])]
        .concat(this.holes.map(hole => hole.map(({ x, y }) => [x, y]))),
    };
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
