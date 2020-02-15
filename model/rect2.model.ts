import { Vector2 } from './vec2.model';
import { GeoJsonPolygon, Poly2 } from './poly2.model';

/**
 * A two dimensional rectangle where {x}, {y} is top-left.
 */
export class Rect2 {

  public get area() {
    return this.width * this.height;
  }

  public get center() {
    return new Vector2(this.cx, this.cy);
  }

  public get cx() {
    return this.x + 0.5 * this.width;
  }

  public get cy() {
    return this.y + 0.5 * this.height;
  }

  public get geoJson(): GeoJsonPolygon {
    return {
      type: 'Polygon',
      coordinates: [
        [
          [this.x, this.y],
          [this.x + this.width, this.y],
          [this.x + this.width, this.y + this.height],
          [this.x, this.y + this.height]
        ]
      ]
    };
  }

  public get json(): Rect2Json {
    return [this.x, this.y, this.width, this.height];
  }

  public get key(): string {
    return `${this.x},${this.y},${this.width},${this.height}`;
  }

  public get poly2(): Poly2 {
    return new Poly2(
      [
        { x: this.x, y: this.y },
        { x: this.x + this.width, y: this.y },
        { x: this.x + this.width, y: this.y + this.height },
        { x: this.x, y: this.y + this.height }
      ].map(Vector2.from)
    );
  }

  public get topRight() {
    return new Vector2(this.x + this.width, this.y);
  }

  public static get zero(): Rect2 {
    return new Rect2(0, 0, 0, 0);
  }

  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number,
  ) {}

  public clone(): Rect2 {
    return new Rect2(this.x, this.y, this.width, this.height);
  }

  public contains({ x, y }: Vector2) {
    return this.x <= x && x <= this.x + this.width && (this.y <= y && y <= this.y + this.height);
  }

  public copy({ x, y, width, height }: DOMRect | Rect2): this {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    return this;
  }

  public covers({ x, y, width, height }: Rect2) {
    return (
      this.x <= x &&
      x + width <= this.x + this.width &&
      this.y <= y &&
      y + height <= this.y + this.height
    );
  }

  /** Returns `Rect2.zero` if no args. */
  public static from(...items: Vector2[]): Rect2
  public static from(...items: Rect2[]): Rect2
  public static from(...items: DOMRect[]): Rect2
  public static from(...items: Rect2[] | Vector2[] | DOMRect[]): Rect2 {
    if (!items.length) {
      return Rect2.zero;
    } else if (items[0] instanceof Vector2) {
      const vectors = items as Vector2[];
      const mx = Math.min(...vectors.map(({ x }) => x));
      const my = Math.min(...vectors.map(({ y }) => y));
      const Mx = Math.max(...vectors.map(({ x }) => x));
      const My = Math.max(...vectors.map(({ y }) => y));
      return new Rect2(mx, my, Mx - mx, My - my);
    } else if (items[0] instanceof Rect2) {
      const rects = items as Rect2[];
      const mx = Math.min(...rects.map(({ x }) => x));
      const my = Math.min(...rects.map(({ y }) => y));
      const Mx = Math.max(...rects.map(({ x, width }) => x + width));
      const My = Math.max(...rects.map(({ y, height }) => y + height));
      return new Rect2(mx, my, Mx - mx, My - my);
    } else {
      const rects = items as DOMRect[];
      const mx = Math.min(...rects.map(({ left }) => left));
      const my = Math.min(...rects.map(({ top }) => top));
      const Mx = Math.max(...rects.map(({ right }) => right));
      const My = Math.max(...rects.map(({ bottom }) => bottom));
      return new Rect2(mx, my, Mx - mx, My - my);
    }
  }

  public static fromJson([ x, y, width, height ]: Rect2Json) {
    return new Rect2(x, y, width, height);
  }

  /** Bounded version of lambda x. this.outset(-x) */
  public inset(nonNegAmount: number) {
    const [cx, cy] = [this.cx, this.cy];
    this.outset(-nonNegAmount);
    if (this.width < 0) {
      this.x = cx;
      this.width = 0;
    }
    if (this.height < 0) {
      this.y = cy;
      this.height = 0;
    }
  }

  /**
   * Does this filled rectangle intersect with {other} filled rectangle?
   */
  public intersects(other: Rect2) {
    return (
      Math.abs(this.cx - other.cx) * 2 < this.width + other.width &&
      Math.abs(this.cy - other.cy) * 2 < this.height + other.height
    );
  }

  public offset({ x, y }: Vector2): Rect2 {
    this.x += x;
    this.y += y;
    return this;
  }

  public outset(nonNegAmount: number): Rect2 {
    this.x -= nonNegAmount;
    this.y -= nonNegAmount;
    this.width += 2 * nonNegAmount;
    this.height += 2 * nonNegAmount;
    return this;
  }

  public scale(k: number): Rect2 {
    this.x *= k;
    this.y *= k;
    this.width *= k;
    this.height *= k;
    return this;
  }

  public translate(dx: number, dy: number): Rect2 {
    this.x += dx;
    this.y += dy;
    return this;
  }

}

/** [x, y, width, height] */
export type Rect2Json = [number, number, number, number];
