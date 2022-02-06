/**
 * A two dimensional coordinate.
 */
 export class Vect {
  /**
   * @param {number} x 
   * @param {number} y 
   */
  constructor(x = 0, y = 0) {
    /** @type {number} */ this.x = x;
    /** @type {number} */ this.y = y;
  }

  get angle() {
    return Math.atan2(this.y, this.x);
  }

  /** @returns {Geom.Coord} */
  get coord() {
    return [this.x, this.y];
  }

  /** @returns {Geom.VectJson} */
  get json(){
    return { x: this.x, y: this.y };
  }

  get length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  get lengthSquared() {
    return this.x * this.x + this.y * this.y;
  }

  static get zero() {
    return new Vect(0, 0);
  }

  /** @param {Geom.VectJson} _ */
  add({ x, y }) {
    return this.translate(x, y);
  }

  /**
   * @param {Geom.VectJson} v 
   * @param {number} s 
   */
	addScaledVector(v, s) {
		this.x += v.x * s;
		this.y += v.y * s;
		return this;
	}

  /** @param {Geom.VectJson} p */
  angleTo(p) {
    return Math.atan2(p.y - this.y, p.x - this.x);
  }  

  /** @param {Vect[]} vectors */
  static average(vectors) {
    return vectors.length
      ? vectors
        .reduce((agg, v) => agg.add(v), Vect.zero)
        .scale(1 / vectors.length)
      : Vect.zero;
  }

  clone() {
    return new Vect(this.x, this.y);
  }

  /** @param {Geom.VectJson} p */
  copy(p) {
    return this.set(p.x, p.y);
  }
  
  /** @param {Geom.VectJson} p */
  distanceTo(p) {
    return Math.hypot(p.x - this.x, p.y - this.y);
  }

  /** @param {Geom.VectJson} p */
  distanceToSquared(p) {
    return Math.pow(p.x - this.x, 2) + Math.pow(p.y - this.y, 2);
  }

  /** @param {Geom.VectJson} other */
  dot(other) {
    return this.x * other.x + this.y * other.y;
  }

  /**
   * @param {number} ox 
   * @param {number} oy 
   */
  dotArgs(ox, oy) {
    return this.x * ox + this.y * oy;
  }

  /** @param {Geom.VectJson} _ */
  equals({ x, y }) {
    return this.x === x && this.y === y;
  }

  /** @param {[number, number] | Geom.VectJson} input */
  static from(input) {
    return Array.isArray(input)
      ? new Vect(input[0], input[1])
      : new Vect(input.x, input.y);
  }

  normalize(newLength = 1) {
    if (this.length) {
      return this.scale(newLength / this.length);
    }
    console.error(`Cannot normalize Vect '${this}' to length '${newLength}'`);
    return this;
  }

  /**
   * @param {number} dp decimal places
   */
  precision(dp) {
    return this.set(
      Number(this.x.toFixed(dp)),
      Number(this.y.toFixed(dp)),
    );
  }

  /** @param {number} radians */
  rotate(radians) {
    const [x, y] = [this.x, this.y];
    this.x = Math.cos(radians) * x - Math.sin(radians) * y;
    this.y = Math.sin(radians) * x + Math.cos(radians) * y;
    return this;
  }

  round() {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    return this;
  }

  /**
   * @param {number} sx 
   * @param {number} [sy] 
   */
  scale(sx, sy = sx) {
    this.x *= sx;
    this.y *= sy;
    return this;
  }

  /**
   * @param {number} x 
   * @param {number} y 
   */
  set(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  /** @param {Geom.VectJson} _ */
  sub({ x, y }) {
    return this.translate(-x, -y);
  }

  /**
   * @param {Geom.VectJson} p
   * @param {Geom.VectJson} q
   */
  subVectors(p, q) {
		this.x = p.x - q.x;
		this.y = p.y - q.y;
    return this;
  }

  toString() {
    return `${this.x},${this.y}`;
  }

  /**
   * @param {number} x
   * @param {number} y
   */
  translate(x, y) {
    this.x += x;
    this.y += y;
    return this;
  }
}
