export class Vector {

  constructor(
    public x: number,
    public y: number,
  ) {}

  public get angle() {
    return Math.atan2(this.y, this.x);
  }

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

  public copy(other: Vector) {
    this.x = other.x;
    this.y = other.y;
    return this;
  }

  public distSquaredTo(other: Vector) {
    return Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2)
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

  round() {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    return this;
  }

  scale(amount: number) {
    this.x *= amount;
    this.y *= amount;
    return this;
  }

  sub(other: VectorJson) {
    this.x -= other.x;
    this.y -= other.y;
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

export class Edge {
  constructor(
    public src: Vector,
    public dst: Vector,
  ) {}

  get midpoint() {
    return new Vector(
      0.5 * (this.src.x + this.dst.x),
      0.5 * (this.src.y + this.dst.y),
    );
  }

  toString() {
    return `${this.src} ${this.dst}`;
  }
}

export class Rect {

  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number,
  ) {}

  public get center() {
    return new Vector(this.x + (this.width / 2), this.y + (this.height / 2));
  }

  public clone() {
    return new Rect(this.x, this.y, this.width, this.height);
  }

  public contains({ x, y }: VectorJson) {
    return this.x <= x &&
      x <= this.x + this.width &&
      this.y <= y &&
      y <= this.y + this.height;
  }

  public get cx() {
    return this.x + 0.5 * this.width;
  }

  public get cy() {
    return this.y + 0.5 * this.height;
  }

  public get e() {
    return this.x + this.width;
  }

  /**
   * Does this filled rectangle intersect with `other` filled rectangle?
   * We exclude corner-point intersections.
   */
  public intersects(other: Rect) {
    return (
      Math.abs(this.cx - other.cx) * 2 < this.width + other.width &&
      Math.abs(this.cy - other.cy) * 2 <= this.height + other.height
    ) || (
      Math.abs(this.cx - other.cx) * 2 <= this.width + other.width &&
      Math.abs(this.cy - other.cy) * 2 < this.height + other.height
    );
  }

  get ne() {
    return new Vector(this.x + this.width, this.y);
  }
  get nw() {
    return new Vector(this.x, this.y);
  }

  /** Anti-clockwise w.r.t y being downwards */
  get points(): [Vector, Vector, Vector, Vector] {
    return [
      new Vector(this.x, this.y),
      new Vector(this.x, this.y + this.height),
      new Vector(this.x + this.width, this.y + this.height),
      new Vector(this.x + this.width, this.y),
    ];
  }

  public get s() {
    return this.y + this.height;
  }

  get se() {
    return new Vector(this.x + this.width, this.y + this.height);
  }
  get sw() {
    return new Vector(this.x, this.y + this.height);
  }

  translate(dx: number, dy: number) {
    this.x += dx;
    this.y += dy;
    return this;
  }

  static get zero() {
    return new Rect(0, 0, 0, 0);
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

export class RectNavGraph {
  /** n/s/e/w relative to '+y goes down screen' */
  public succ: Map<Rect, {
    all: Rect[];
    n: Rect[];
    e: Rect[];
    s: Rect[];
    w: Rect[];
  }>;

  public toPolygon: Map<Rect, Polygon>;

  constructor(public rects: Rect[]) {
    this.succ = new Map;
    this.toPolygon = new Map;

    const sort = (coord: 'x' | 'y', dir: 1 | -1) =>
      (a: Rect, b: Rect) => dir * (a[coord] <  b[coord] ? -1 : 1);

    this.rects.forEach(r => {
            
      const all = this.rects.filter(o => o !== r && o.intersects(r));
      this.succ.set(r, {
        all,
        n: all.filter(o => r.y === o.y + o.height).sort(sort('x', -1)),
        e: all.filter(o => r.x + r.width === o.x).sort(sort('y', 1)),
        s: all.filter(o => r.y + r.height === o.y).sort(sort('x', 1)),
        w: all.filter(o => r.x === o.x + o.width).sort(sort('y', -1)),
      });

      const { n, s, e, w } = this.succ.get(r)!;
      /**
       * Polyanya views +y as upwards and expects relatively anticlockwise polygons.
       * We agree with polyanya's convention, which is more conventional in mathematics.
       * North-east-south-west traversal is clockwise wrt y+ down, anticlockwise wrt y+ up.
       */
      this.toPolygon.set(r, new Polygon([
        // along north-side (left to right)
        r.nw, ...n.flatMap(o => [o.x > r.x && o.sw, o.e < r.e && o.se]).filter(Boolean) as Vector[],
        // along east-side (top to bottom)
        r.ne, ...e.flatMap(o => [o.y > r.y && o.nw, o.s < r.s && o.sw]).filter(Boolean) as Vector[],
        // along south-side (right to left)
        r.se, ...s.flatMap(o => [o.e < r.e && o.ne, o.x > r.x && o.nw]).filter(Boolean) as Vector[],
        // along west-side (bottom to top)
        r.sw, ...w.flatMap(o => [o.s < r.s && o.se, o.y > r.y && o.ne]).filter(Boolean) as Vector[],
      ]));
    });

  }

}
