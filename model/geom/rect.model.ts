import { Vector, VectorJson } from "./vector.model";

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

  toString() {
    return `${this.x},${this.y},${this.width},${this.height}`;
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