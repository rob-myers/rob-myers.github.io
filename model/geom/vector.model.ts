export class Vector {

  constructor(
    public x = 0,
    public y = 0,
  ) {}

  add(other: VectorJson) {
    this.x += other.x;
    this.y += other.y;
    return this;
  }
  
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

  public copy(other: VectorJson) {
    this.x = other.x;
    this.y = other.y;
    return this;
  }

  public distSquaredTo(other: VectorJson) {
    return Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2)
  }
  
  public distTo(other: VectorJson) {
    return Math.sqrt(this.distSquaredTo(other));
  }

  equals({ x, y }: VectorJson) {
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

  precision(digits = 2) {
    this.x = Number(this.x.toFixed(digits));
    this.y = Number(this.y.toFixed(digits));
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
