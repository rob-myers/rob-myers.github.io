import { Vect } from './vect';

/**
 * A two dimensional rectangle where `(x, y)` is viewed as top left.
 */
export class Rect {
  /**
   * @param {number} x 
   * @param {number} y 
   * @param {number} width 
   * @param {number} height 
   */
  constructor(x = 0, y = 0, width = 0, height = 0) {
    /** @type {number} */ this.x = x;
    /** @type {number} */ this.y = y;
    /** @type {number} */ this.width = width;
    /** @type {number} */ this.height = height;
  }

  get area() {
    return this.width * this.height;
  }

  get bottom() {
    return this.y + this.height;
  }

  get bottomLeft() {
    return new Vect(this.x, this.y + this.height);
  }

  get bottomRight() {
    return new Vect(this.x + this.width, this.y + this.height);
  }

  get center() {
    return new Vect(this.cx, this.cy);
  }

  get cx() {
    return this.x + 0.5 * this.width;
  }

  get cy() {
    return this.y + 0.5 * this.height;
  }

  /** @returns {Geom.GeoJsonPolygon} */
  get geoJson() {
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

  /** @returns {Geom.RectJson} */
  get json() {
    return { 
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  get key() {
    return `${this.x},${this.y},${this.width},${this.height}`;
  }

  get dimension() {
    return Math.max(this.width, this.height);
  }

  /**
   * Anti-clockwise w.r.t y being downwards
   * @returns {[Vect, Vect, Vect, Vect]}
   */
  get points() {
    return [
      new Vect(this.x, this.y),
      new Vect(this.x, this.y + this.height),
      new Vect(this.x + this.width, this.y + this.height),
      new Vect(this.x + this.width, this.y),
    ];
  }

  get right() {
    return this.x + this.width;
  }

  get topLeft() {
    return new Vect(this.x, this.y);
  }

  get topRight() {
    return new Vect(this.x + this.width, this.y);
  }

  static get zero() {
    return new Rect(0, 0, 0, 0);
  }

  /** @param {import('./mat').Mat} m */
  applyMatrix(m) {
    if (!m.isIdentity) {
      const p = m.transformPoint(this.topLeft);
      const q = m.transformPoint(this.bottomRight);
      this.x = Math.min(p.x, q.x);
      this.y = Math.min(p.y, q.y);
      this.width = Math.max(p.x, q.x) - this.x;
      this.height = Math.max(p.y, q.y) - this.y;
    }
    return this;
  }

  clone() {
    return new Rect(this.x, this.y, this.width, this.height);
  }

  /** @param {Geom.VectJson} _ */
  contains({ x, y }) {
    return this.x <= x && x <= this.x + this.width && (this.y <= y && y <= this.y + this.height);
  }

  /** @param {Geom.RectJson} _ */
  copy({ x, y, width, height }) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    return this;
  }

  /** @param {Rect} _ */
  covers({ x, y, width, height }) {
    return (
      this.x <= x &&
      x + width <= this.x + this.width &&
      this.y <= y &&
      y + height <= this.y + this.height
    );
  }

  /**
   * @param {number} dx 
   * @param {number} dy 
   */
  delta(dx, dy) {
    this.x += dx;
    this.y += dy;
    return this;
  }

  /** @param {Geom.RectJson} _ */
  static fromJson({ x, y, width, height }) {
    return new Rect(x, y, width, height);
  }

  /** 
   * @param {Geom.VectJson[]} items
   */
   static fromPoints(...items) {
    if (!items.length) {
      return Rect.zero;
    } else {
      const vectors = /** @type {Vect[]} */ (items);
      const mx = Math.min(...vectors.map(({ x }) => x));
      const my = Math.min(...vectors.map(({ y }) => y));
      const Mx = Math.max(...vectors.map(({ x }) => x));
      const My = Math.max(...vectors.map(({ y }) => y));
      return new Rect(mx, my, Mx - mx, My - my);
    }
  }

  /** 
   * @param {Geom.RectJson[]} items
   */
   static fromRects(...items) {
    if (!items.length) {
      return Rect.zero;
    } else {
      const rects = /** @type {Geom.RectJson[]} */ (items);
      const mx = Math.min(...rects.map(({ x }) => x));
      const my = Math.min(...rects.map(({ y }) => y));
      const Mx = Math.max(...rects.map(({ x, width }) => x + width));
      const My = Math.max(...rects.map(({ y, height }) => y + height));
      return new Rect(mx, my, Mx - mx, My - my);
    }
  }

  /**
   * Bounded version of `lambda x.this.outset(-x)`
   * @param {number} nonNegAmount 
   */
  inset(nonNegAmount) {
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
    return this;
  }

  /**
   * Does this filled bordered rectangle intersect with {other} filled rectangle?
   * @param {Rect} other
   */
  intersects(other) {
    return (
      Math.abs(this.cx - other.cx) * 2 <= this.width + other.width &&
      Math.abs(this.cy - other.cy) * 2 <= this.height + other.height
    );
  }

  /** @param {any} input */
  static isRectJson(input) {
    return input && typeof input.x === 'number' && typeof input.y === 'number' && typeof input.width === 'number' && typeof input.height === 'number';
  }

  /** @param {Geom.VectJson} _ */
  offset({ x, y }) {
    this.x += x;
    this.y += y;
    return this;
  }

  /**
   * @param {number} nonNegDx 
   * @param {number} [nonNegDy]
   */
  outset(nonNegDx, nonNegDy = nonNegDx) {
    this.x -= nonNegDx;
    this.y -= nonNegDy;
    this.width += 2 * nonNegDx;
    this.height += 2 * nonNegDy;
    return this;
  }

  /**
   * Mutate precision.
   * @param {number} dp decimal places
   */
  precision(dp) {
    return this.set(
      Number(this.x.toFixed(dp)),
      Number(this.y.toFixed(dp)),
      Number(this.width.toFixed(dp)),
      Number(this.height.toFixed(dp)),
    );
  }

  /** @param {number} k */
  scale(k) {
    this.x *= k;
    this.y *= k;
    this.width *= k;
    this.height *= k;
    return this;
  }

  /**
   * @param {number} x 
   * @param {number} y 
   * @param {number} w 
   * @param {number} h 
   */
  set(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    return this;
  }

  /** @param {Geom.RectJson} _ */
  setFromJson({ x, y, width, height }) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    return this;
  }

  /** @param {Geom.VectJson} position */
  setPosition(position) {
    this.x = position.x;
    this.y = position.y;
    return this;
  }

  toString() {
    return `${this.x},${this.y},${this.width},${this.height}`;
  }

}
