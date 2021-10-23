import { Poly, Rect, Vect } from '../geom';

class GeomService {

  /**
   * Compute intersection of two infinite lines i.e.
   * 1. `lambda x. p0 + x * d0`.
   * 2. `lambda x. p1 + x * d1`.
   *
   * If they intersect non-degenerately return solution of (1), else `null`.
   * @param {Vect} p0
   * @param {Vect} d0
   * @param {Vect} p1
   * @param {Vect} d1
   * @returns {number | null}
   */
  getLinesIntersect(p0, d0, p1, d1) {
    /**
     * Recall normal_0 is (-d0.y, d0.x).
     * No intersection if directions d0, d1 approx. parallel, ignoring colinear.
     */
    if (Math.abs(-d0.y * d1.x + d0.x * d1.y) < 0.0001) {
      return null;
    }
    return (d1.x * (p1.y - p0.y) - d1.y * (p1.x - p0.x)) / (d0.y * d1.x - d1.y * d0.x);
  }

  /**
   * Get intersection between line `p + λ.d` and line segment `[q0, q1]`.
   * Returns `λ` or null if no intersection.
   * @param {Geom.Vect} p 
   * @param {Geom.Vect} d 
   * @param {Geom.Vect} q0 
   * @param {Geom.Vect} q1 
   */
  getLineLineSegIntersect(p, d, q0, q1) {
    // normal n = (-dy,dx)
    let dx = d.x, dy = d.y, px = p.x, py = p.y,
        // dot products (q0 - p).n and (q1 -p).n
        k1 = (q0.x - px)*-dy + (q0.y - py)*dx, 
        k2 = (q1.x - px)*-dy + (q1.y - py)*dx,
        dqx, dqy, z, s0, s1;
    
    // (q0 - p).n and (q1 - p).n are both zero
    // iff both q0 and q1 lie along the line p + lambda * d
    if (k1 === 0 && k2 === 0) {
        // return signed distance to closer point
        s0 = (q0.x - px)*dx + (q0.y - py)*dy;
        s1 = (q1.x - px)*dx + (q1.y - py)*dy;
        return (Math.abs(s0) < Math.abs(s1)) ? s0 : s1;
    }
    // if (q0 - p).n and (q1 - p).n have different signs
    // (where at most one of them is zero)
    // then they must intersect the line p --d-->
    else if (k1 * k2 <= 0) {
        dqx = q1.x - q0.x;
        dqy = q1.y - q0.y;
        // compute z-component of cross product d \times (q1 - q0)
        z = dx * dqy - dy * dqx;
        // z shouldn't equal 0 since then p,q0,q1 colinear and k1 = k2 = 0
        // but we check anyway (?)
        if(z === 0) return null;
        // otherwise have formula for signed distance
        // coming from two simultaneous equations for line vs line intersection
        return (py*dqx + px*-dqy + (q0.x * q1.y - q0.y * q1.x)) / z;
    }
    return null;
  }

  /**
   * Compute intersection of 2 line segments:
   * - p0 -- p1
   * - q0 -- q1
   *
   * If they intersect, return lambda in [0, 1] s.t. intersection is
   * `p0 + (p1 - p0) * lambda`, else return null.
   * @param {Vect} p0
   * @param {Vect} p1
   * @param {Vect} q0
   * @param {Vect} q1
   */
  getLineSegsIntersection(p0, p1, q0, q1) {
    let dpx = p1.x - p0.x,
        dpy = p1.y - p0.y,
        dqx = q1.x - q0.x,
        dqy = q1.y - q0.y,
        s, t,
        z = -dqx * dpy + dpx * dqy;
  
    if (z === 0){
      /**
       * Line segs are parallel, so both have non-normalized
       * normal (-dpy, dpx). For colinearity they must have
       * the same dot product w.r.t latter.
       */
      if ((p0.x * -dpy + p0.y * dpx) === (q0.x * -dpy + q0.y * dpx)){
        /**
         * Check if p0 or p1 lies between both q0 and q1.
         */
        t = dqx * dqx + dqy * dqy;
        s = (p0.x - q0.x) * dqx + (p0.y - q0.y) * dqy;
        if (0 <= s && s <= t) {
          return s / t;
        }
        s = (p1.x - q0.x) * dqx + (p1.y - q0.y) * dqy;
        if (0 <= s && s <= t) {
          return s / t;
        }
      }
      return null;
    } else {
      s = (-dpy * (p0.x - q0.x) + dpx * (p0.y - q0.y)) / z;
      t = (dqx  * (p0.y - q0.y) - dqy * (p0.x - q0.x)) / z;
      if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
        return t;
      }
    }
    return null;
  }

  /**
   * Join disjoint triangulations
   * @param {Geom.Triangulation[]} triangulations 
   * @returns {Geom.Triangulation}
   */
  joinTriangulations(triangulations) {
    if (triangulations.length === 1) return triangulations[0];
    /** @type {Vect[]} */
    const vs = [];
    /** @type {[number, number, number][]} */
    const tris =  [];
    let offset = 0;
    for (const decomp of triangulations) {
      vs.push(...decomp.vs);
      tris.push(...decomp.tris.map(tri => /** @type {[number, number, number]} */ (tri.map(x => x += offset))));
      offset += decomp.vs.length;
    }
    return { vs, tris };
  }

  /**
   * @param {Poly[]} polygons 
   * @returns {Geom.Triangulation}
   */
  polysToTriangulation(polygons) {
    const decomps = polygons.map(p => p.qualityTriangulate());
    return this.joinTriangulations(decomps);
  }

  /**
   * Convert a polygonal rectangle back into a Rect with angle.
   * We ensure the width is greater than or equal to the height.
   * @param {Geom.Poly} poly
   * @returns {Geom.FourGon<Geom.Rect>}
   */
  polyToAngledRect(poly) {
    const ps = poly.outline;
    const w = tempVect.copy(ps[1]).sub(ps[0]).length;
    const h = tempVect2.copy(ps[2]).sub(ps[1]).length;

    if (w >= h) {
      return {
        rect: new Rect(ps[0].x, ps[0].y, w, h),
        angle: Math.atan2(tempVect.y, tempVect.x) * (180 / Math.PI),
      };
    } else {
      return {
        rect: new Rect(ps[1].x, ps[1].y, h, w),
        angle: Math.atan2(tempVect2.y, tempVect2.x) * (180 / Math.PI),
      };
    }
  }

  /**
   * Force radian to range [0, 2pi).
   * @param {number} radian
   */
  radRange(radian) {
    radian %= (2 * Math.PI);
    // if (Math.abs(x) <= 0.001) x = 0;
    return radian >= 0 ? radian : (2 * Math.PI + radian);
  }

  /** @param {Vect[]} path */
  removePathReps(path) {
    /** @type {Geom.VectJson} */
    let prev;
    return path.reduce((agg, p) => {
      if (!(prev && (p.x === prev.x) && (p.y === prev.y))) {
        agg.push(prev = p);
      }
      return agg;
    }, /** @type {typeof path} */ ([]));
  }

  /**
   * @param {Geom.Triangulation} decomp 
   * @returns {Geom.Poly[]}
   */
  triangulationToPolys(decomp) {
    return decomp.tris.map(([u, v, w]) =>
      new Poly([decomp.vs[u], decomp.vs[v], decomp.vs[w]])
    );
  }
}

const tempVect = new Vect;
const tempVect2 = new Vect;

export const geom = new GeomService;
