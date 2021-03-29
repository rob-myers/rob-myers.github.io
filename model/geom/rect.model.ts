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

  public static from({ x, y, width, height }: RectJson) {
    return new Rect(x, y, width, height);
  }

  public static fromPoints(...ps: VectorJson[]) {
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

  public static fromString(input: string) {
    return new Rect(// see this.toString
      ...input.split(',').map(Number) as [number, number, number, number]
    );
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

  public outset(nonNegAmount: number): Rect {
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

  /** Enforce 2 d.p. precision */
  precision() {
    this.x = Number(this.x.toFixed(2));
    this.y = Number(this.y.toFixed(2));
    this.width = Number(this.width.toFixed(2));
    this.height = Number(this.height.toFixed(2));
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
  public get s() {
    return this.y + this.height;
  }

  /** Assume scalar is positive */
  public scale(scalar: number) {
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
