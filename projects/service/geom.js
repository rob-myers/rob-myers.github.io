import { Poly, Vect } from '../geom';

class GeomService {
  // /**
  //  * @param {string} navKey
  //  * @param {Poly[]} navPolys
  //  * @param {Partial<INavMeshParameters>} [opts]
  //  */
  // async createNavMesh(navKey, navPolys, opts) {
  //   await recast.ready();
  //   if (navPolys.length) {
  //     const triangulation = this.polysToTriangulation(navPolys);
  //     recast.createNavMesh(navKey, triangulation, opts);
  //   } else {
  //     recast.clearNavMesh(navKey);
  //   }
  // }

  // /**
  //  * @param {string} navKey 
  //  * @param {Geom.VectJson} src
  //  * @param {Geom.VectJson} dst 
  //  * @returns {Vect[]}
  //  */
  // requestNavPath(navKey, src, dst) {
  //   try {
  //     const navPath = recast.computePath(navKey, src, dst);
  //     return this.removePathReps(navPath.map(x => x.precision(1)));
  //   } catch (e) {
  //     console.error('nav error', e);
  //     return [];
  //   }
  // }

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
   getLinesIntersection(p0, d0, p1, d1) {
    const d0x = d0.x,
      d0y = d0.y,
      p0x = p0.x,
      p0y = p0.y,
      d1x = d1.x,
      d1y = d1.y,
      p1x = p1.x,
      p1y = p1.y;
    /**
     * Recall that normal_0 is (-d0y, d0x).
     * No intersection if the directions d0, d1 are approx. parallel,
     * ignoring colinear case.
     */
    if (Math.abs(-d0y * d1x + d0x * d1y) < 0.0001) {
      return null;
    }
    return (d1x * (p1y - p0y) - d1y * (p1x - p0x)) / (d0y * d1x - d1y * d0x);
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
  
    if(z === 0){
      /**
       * Line segs are parallel, so both have un-normalized
       * normal (-dpy, dpx). For colinearity they must have
       * the same normal w.r.t latter.
       */
      if((p0.x * -dpy + p0.y * dpx) === (q0.x * -dpy + q0.y * dpx)){
        /**
         * Check if p0 or p1 lies between both q0 and q1.
         */
        t = dqx * dqx + dqy * dqy;
        s = (p0.x - q0.x) * dqx + (p0.y - q0.y) * dqy;
        if(0 <= s && s <= t) {
          return s / t;
        }
        s = (p1.x - q0.x) * dqx + (p1.y - q0.y) * dqy;
        if(0 <= s && s <= t) {
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
    const vs = /** @type {Vect[]} */ [];
    const tris = /** @type {[number, number, number][]} */ ([]);
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

export const geom = new GeomService;
