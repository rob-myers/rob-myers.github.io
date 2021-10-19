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
   * @param {Geom.Poly} poly
   * @returns {Geom.AngledRect}
   */
  polyRectToRect(poly) {
    const ps = poly.outline;
    const h = tempVect.copy(ps[2]).sub(ps[1]).length;
    const w = tempVect.copy(ps[1]).sub(ps[0]).length;
    return {
      rect: new Rect(ps[0].x, ps[0].y, w, h),
      angle: Math.atan2(tempVect.y, tempVect.x),
    };
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
}

const tempVect = new Vect;

export const geom = new GeomService;
