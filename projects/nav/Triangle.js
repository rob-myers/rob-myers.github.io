/**
 * Source https://github.com/mrdoob/three.js/blob/dev/src/math/Vector2.js
 */
import { Vect } from "../geom";
import { VectJson } from "../geom/types";

export class Triangle {

  constructor( a = new Vect(), b = new Vect(), c = new Vect() ) {
		this.a = a;
		this.b = b;
		this.c = c;
	}

  /**
   * @param {VectJson} p
   * @param {Vect} target
   */
	closestPointToPoint(p, target) {
		const a = this.a, b = this.b, c = this.c;
    /** @type {number} */
		let v;
    /** @type {number} */
    let w;

		// algorithm thanks to Real-Time Collision Detection by Christer Ericson,
		// published by Morgan Kaufmann Publishers, (c) 2005 Elsevier Inc.,
		// under the accompanying license; see chapter 5.1.5 for detailed explanation.
		// basically, we're distinguishing which of the voronoi regions of the triangle
		// the point lies in with the minimum amount of redundant computation.

		_vab.subVectors(b, a);
		_vac.subVectors(c, a);
		_vap.subVectors(p, a);
		const d1 = _vab.dot( _vap );
		const d2 = _vac.dot( _vap );
		if ( d1 <= 0 && d2 <= 0 ) {
			// vertex region of A; barycentric coords (1, 0, 0)
			return target.copy( a );
		}

		_vbp.subVectors( p, b );
		const d3 = _vab.dot( _vbp );
		const d4 = _vac.dot( _vbp );
		if ( d3 >= 0 && d4 <= d3 ) {
			// vertex region of B; barycentric coords (0, 1, 0)
			return target.copy(b);
		}

		const vc = d1 * d4 - d3 * d2;
		if ( vc <= 0 && d1 >= 0 && d3 <= 0 ) {
			v = d1 / ( d1 - d3 );
			// edge region of AB; barycentric coords (1-v, v, 0)
			return target.copy(a).addScaledVector( _vab, v );
		}

		_vcp.subVectors(p, c);
		const d5 = _vab.dot(_vcp);
		const d6 = _vac.dot(_vcp);
		if (d6 >= 0 && d5 <= d6) {

			// vertex region of C; barycentric coords (0, 0, 1)
			return target.copy( c );

		}

		const vb = d5 * d2 - d1 * d6;
		if ( vb <= 0 && d2 >= 0 && d6 <= 0 ) {

			w = d2 / ( d2 - d6 );
			// edge region of AC; barycentric coords (1-w, 0, w)
			return target.copy( a ).addScaledVector( _vac, w );

		}

		const va = d3 * d6 - d5 * d4;
		if ( va <= 0 && ( d4 - d3 ) >= 0 && ( d5 - d6 ) >= 0 ) {

			_vbc.subVectors( c, b );
			w = ( d4 - d3 ) / ( ( d4 - d3 ) + ( d5 - d6 ) );
			// edge region of BC; barycentric coords (0, 1-w, w)
			return target.copy( b ).addScaledVector( _vbc, w ); // edge region of BC

		}

		// face region
		const denom = 1 / ( va + vb + vc );
		// u = va * denom
		v = vb * denom;
		w = vc * denom;

		return target.copy( a ).addScaledVector( _vab, v ).addScaledVector( _vac, w );
	}

  /**
   * @param {VectJson} a 
   * @param {VectJson} b 
   * @param {VectJson} c 
   */
  set(a, b, c) {
		this.a.copy( a );
		this.b.copy( b );
		this.c.copy( c );
		return this;
	}
}

const _vab = /*@__PURE__*/ new Vect();
const _vac = /*@__PURE__*/ new Vect();
const _vap = /*@__PURE__*/ new Vect();
const _vbp = /*@__PURE__*/ new Vect();
const _vcp = /*@__PURE__*/ new Vect();
const _vbc = /*@__PURE__*/ new Vect();
