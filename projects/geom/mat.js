/**
 * A (2 row) * (3 col) affine 2d transformation matrix.
 * - Based on https://github.com/thednp/DOMMatrix/blob/master/src/index.js
 * - String format `matrix(a, b, c, d, e, f)`.
 */
export class Mat {
  /** @param  {string | SixTuple} [args] */
  constructor(args) {
    this.a = 1;
    this.b = 0;
    this.c = 0;
    this.d = 1;
    this.e = 0;
    this.f = 0;
    return args instanceof Array
      ? this.setMatrixValue(/** @type {SixTuple} */(args))
      : this.setMatrixValue(/** @type {undefined | string} */(args));
  }

  /**
	 * The determinant of 2x2 part of affine matrix.
	 * @returns {number}
	 */
	get determinant() {
		return this.a * this.d - this.b * this.c;
	}

  /**
	 * Get an inverse matrix of current matrix. The method returns a new
	 * matrix with values you need to use to get to an identity matrix.
	 * Context from parent matrix is not applied to the returned matrix.
   * > https://github.com/deoxxa/transformation-matrix-js/blob/5d0391a169e938c31da6c09f5d4e7dc836fd0ec2/src/matrix.js#L329
	 * @returns {Mat}
	 */
  getInverseMatrix() {
    if (this.isIdentity) {
			return new Mat;
		}
		else if (!this.isInvertible) {
			throw Error("Matrix is not invertible.");
		}
		else {
			let me = this,
				a = me.a,
				b = me.b,
				c = me.c,
				d = me.d,
				e = me.e,
				f = me.f,

				m = new Mat,
				dt = a * d - b * c;	// determinant(), skip DRY here...

			m.a = d / dt;
			m.b = -b / dt;
			m.c = -c / dt;
			m.d = a / dt;
			m.e = (c * f - d * e) / dt;
			m.f = -(a * f - b * e) / dt;

			return m;
		} 
  }

  get isIdentity() {
    return (
      this.a === 1 && this.b === 0
      && this.c === 0 && this.d === 1
      && this.e === 0 && this.f === 0
    );
  }

  get isInvertible() {
		return Math.abs(this.determinant) >= 1e-14
	}

  /**
   * @param {number} dp decimal places
   */
  precision(dp) {
    this.feedFromArray([
      Number(this.a.toFixed(dp)),
      Number(this.b.toFixed(dp)),
      Number(this.c.toFixed(dp)),
      Number(this.d.toFixed(dp)),
      Number(this.e.toFixed(dp)),
      Number(this.f.toFixed(dp)),
    ]);
  }

  /**
   * Multiply this matrix (left) against param matrix (right).
   * @param {SixTuple} _
   */
  preMultiply([a, b, c, d, e, f]) {
    const ma = this.a * a + this.c * b + this.e * 0;
    const mb = this.b * a + this.d * b + this.f * 0;
    const mc = this.a * c + this.c * d + this.e * 0;
    const md = this.b * c + this.d * d + this.f * 0;
    const me = this.a * e + this.c * f + this.e * 1;
    const mf = this.b * e + this.d * f + this.f * 1;
    return this.feedFromArray([ma, mb, mc, md, me, mf]);
  }

  setIdentity() {
    this.a = 1;
    this.b = 0;
    this.c = 0;
    this.d = 1;
    this.e = 0;
    this.f = 0;
  }

  /** @param  {undefined | string | SixTuple | MatrixJson} source */
  setMatrixValue(source) {
    if (typeof source === 'string') {
      const transform = source
        .slice('matrix('.length, -')'.length).split(',').map(Number);
      return this.feedFromArray( /** @type {SixTuple} */ (transform));
    } else if (!source) {
      return this;
    } else if (Array.isArray(source)) {
      return this.feedFromArray(source);
    } else {
      return this.feedFromArray([source.a, source.b, source.c, source.d, source.e, source.f]);
    }
  }

  /** @param {number} angle radians */
  setRotation(angle) {
    return this.feedFromArray([
      Math.cos(angle),
      Math.sin(angle),
      -Math.sin(angle),
      Math.cos(angle),
      0,
      0,
    ]);
  }

  /** @returns {SixTuple} */
  toArray() {
    return [this.a, this.b, this.c, this.d, this.e, this.f];
  }

  /**
   * Transform point, mutating it.
   * @template {Geom.VectJson} T
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

  /** @param {SixTuple} _ */
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
