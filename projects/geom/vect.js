// eslint-disable-next-line no-unused-vars
import * as Geom from './types';

/**
 * A two dimensional coordinate.
 */
 export class Vect {

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

  /**
   * @param {number} x 
   * @param {number} y 
   */
  constructor(x, y) {
    /** @type {number} */ this.x = x;
    /** @type {number} */ this.y = y;
  }

  /** @param {Geom.VectJson} _ */
  add({ x, y }) {
    return this.translate(x, y);
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
    return Math.sqrt(
      Math.pow(p.x - this.x, 2)
      + Math.pow(p.y - this.y, 2)
    );
  }

  /** @param {Geom.VectJson} other */
  dot(other) {
    return this.x * other.x + this.y * other.y;
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
    console.error(`Cannot normalize Vector2 '${this}' to length '${newLength}'`);
    return this;
  }

  /** @param {number} radians */
  rotate(radians) {
    const [x, y] = [this.x, this.y];
    this.x = Math.cos(radians) * x - Math.sin(radians) * y;
    this.y = Math.sin(radians) * x + Math.cos(radians) * y;
    return this;
  }

  /** @param {number} amount */
  scale(amount) {
    this.x *= amount;
    this.y *= amount;
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

  toString() {
    return `${this.x},${this.y}`;
  }

  /** @param {DOMMatrix} _ */
  transform({ a, b, c, d, e, f }) {
    const { x, y } = this;
    this.x = a * x + c * y + e;
    this.y = b * x + d * y + f;
    return this;
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
