import { VectJson } from './types';

/**
 * A 2*3 affine 2d transformation matrix.
 * - Based on https://github.com/thednp/DOMMatrix/blob/master/src/index.js
 * - String format `matrix(a, b, c, d, e, f)`.
 */
export class Mat {
  /** @param  {[undefined] | [string] | SixTuple} args */
  constructor(...args) {
    this.a = 1;
    this.b = 0;
    this.c = 0;
    this.d = 1;
    this.e = 0;
    this.f = 0;
    return args.length > 1
      ? this.setMatrixValue(/** @type {SixTuple} */(args))
      : this.setMatrixValue(/** @type {undefined | string} */(args[0]));
  }

  get isIdentity() {
    return (
      this.a === 1 && this.b === 0
      && this.c === 0 && this.d === 1
      && this.e === 0 && this.f === 0
    );
  }

  /** @param  {undefined | string | SixTuple | MatrixJson} source */
  setMatrixValue(source) {
    if (typeof source === 'string') {
      const transform = source
        .slice('matrix('.length, -')'.length).split(',').map(Number);
      return this.feedFromArray(transform);
    } else if (!source) {
      return this;
    } else if (Array.isArray(source)) {
      return this.feedFromArray([this.a, this.b, this.c, this.d, this.e, this.f]);
    } else {
      return this.feedFromArray([source.a, source.b, source.c, source.d, source.e, source.f]);
    }
  }

  /**
   * Transform point, mutating it.
   * @template {VectJson} T
   * @param {T} v
   * @returns {T}
   */
  transformPoint(v) {
    let x = this.a * v.x + this.c * v.y + this.e;
    let y = this.b * v.x + this.d * v.y + this.f;
    v.x = x;
    v.y = y;
    return v;
  }

  /** @param {number[]} _ */
  feedFromArray([a, b, c, d, e, f]) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.e = e;
    this.f = f;
    return this;
  }
}

/** @typedef {[number, number, number, number, number, number]} SixTuple */

/** @typedef {{ a: number; b: number; c: number; d: number; e: number; f: number }} MatrixJson */
