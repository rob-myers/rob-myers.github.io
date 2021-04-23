import { Vector, VectorJson } from "./vector.model";

export class Rect {

  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number,
  ) {}

  get area() {
    return this.width * this.height;
  }

  get center() {
    return new Vector(this.x + (this.width / 2), this.y + (this.height / 2));
  }

  add({ x, y }: VectorJson) {
    this.x += x;
    this.y += y;
    return this;
  }

  clone() {
    return new Rect(this.x, this.y, this.width, this.height);
  }

  contains({ x, y }: VectorJson) {
    return this.x <= x &&
      x <= this.x + this.width &&
      this.y <= y &&
      y <= this.y + this.height;
  }

  containsRect(other: Rect) {
    return (
      (this.x <= other.x && other.e <= this.e)
      && (this.y <= other.y && other.s <= this.s)
    );
  }

  copy({ x, y, width, height }: Rect) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    return this;
  }

  get cx() {
    return this.x + 0.5 * this.width;
  }

  get cy() {
    return this.y + 0.5 * this.height;
  }

  get e() {
    return this.x + this.width;
  }

  static from({ x, y, width, height }: RectJson) {
    return new Rect(x, y, width, height);
  }

  static fromPoints(...ps: VectorJson[]) {
    if (ps.length) {
      let mx = ps[0].x, my = ps[0].y, Mx = mx, My = my;
      ps.forEach(p => {
        mx = Math.min(mx, p.x);
        Mx = Math.max(Mx, p.x);
        my = Math.min(my, p.y);
        My = Math.max(My, p.y);
      });
      return new Rect(mx, my, Mx - mx, My - my);
    }
    return Rect.zero;
  }

  static fromString(input: string) {
    return new Rect(// see this.toString
      ...input.split(',').map(Number) as [number, number, number, number]
    );
  }

  /** Expects "well-formed" inset */
  inset(nonNegAmount: number): Rect {
    this.x += nonNegAmount;
    this.y += nonNegAmount;
    this.width -= 2 * nonNegAmount;
    this.height -= 2 * nonNegAmount;
    return this;
  }

  /**
   * Does this filled rectangle intersect with `other` filled rectangle?
   * We exclude corner-point intersections.
   */
  intersects(other: Rect) {
    return (
      Math.abs(this.cx - other.cx) * 2 < this.width + other.width &&
      Math.abs(this.cy - other.cy) * 2 <= this.height + other.height
    ) || (
      Math.abs(this.cx - other.cx) * 2 <= this.width + other.width &&
      Math.abs(this.cy - other.cy) * 2 < this.height + other.height
    );
  }

  get json(): RectJson {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }

  /** w.r.t. y+ downwards */
  get ne() {
    return new Vector(this.x + this.width, this.y);
  }
  /** w.r.t. y+ downwards */
  get nw() {
    return new Vector(this.x, this.y);
  }

outset(nonNegAmount: number): Rect {
    this.x -= nonNegAmount;
    this.y -= nonNegAmount;
    this.width += 2 * nonNegAmount;
    this.height += 2 * nonNegAmount;
    return this;
  }

  /** Anti-clockwise w.r.t y+ being downwards */
  get points(): [Vector, Vector, Vector, Vector] {
    return [
      new Vector(this.x, this.y),
      new Vector(this.x, this.y + this.height),
      new Vector(this.x + this.width, this.y + this.height),
      new Vector(this.x + this.width, this.y),
    ];
  }

  /** Enforce decimal place precision */
  precision(dp = 1) {
    this.x = Number(this.x.toFixed(dp));
    this.y = Number(this.y.toFixed(dp));
    this.width = Number(this.width.toFixed(dp));
    this.height = Number(this.height.toFixed(dp));
    return this;
  }

  round() {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    this.width = Math.round(this.width);
    this.height = Math.round(this.height);
    return this;
  }

  /** w.r.t. y+ downwards */
  get s() {
    return this.y + this.height;
  }

  /** Assume scalar is positive */
  scale(scalar: number) {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  /** w.r.t. y+ downwards */
  get se() {
    return new Vector(this.x + this.width, this.y + this.height);
  }
  /** w.r.t. y+ downwards */
  get sw() {
    return new Vector(this.x, this.y + this.height);
  }

  toString() {
    return `${this.x},${this.y},${this.width},${this.height}`;
  }

  translate({ x, y }: VectorJson) {
    this.x += x;
    this.y += y;
    return this;
  }

  static union(rects: Rect[]) {
    return Rect.fromPoints(...rects.flatMap(r => [r.nw, r.se]));
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
