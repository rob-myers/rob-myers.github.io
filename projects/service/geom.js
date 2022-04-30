import { Poly, Rect, Vect } from '../geom';

class geomService {

  /**
   * @param {Vect} p 
   * @returns {[Geom.Direction, Geom.Direction]}
   */
  compassPoints(p) {
    if (p.x > 0) {
      if (p.y > 0) {
        return p.x > p.y ? ([1, 2]) : [2, 1]; // { 'e', 's' }
      } else {
        return p.x > p.y ? [1, 0] : [0, 1]; // { 'e', 'n' }
      }
    } else {
      if (p.y > 0) {
        return -p.x > p.y ? [3, 2] : [2, 3]; // { 'w', 's' }
      } else {
        return -p.x > -p.y ? [3, 0] : [0, 3]; // { 'w', 'n' }
      }
    }
  }

  /**
   * https://github.com/davidfig/intersects/blob/master/line-polygon.js
   * Does line segment intersect polygon?
   * - we ignore holes
   * @param {Geom.VectJson} u 
   * @param {Geom.VectJson} v 
   * @param {Geom.Poly} polygon Only outline taken into consideration
   * @param {number} [tolerance] 
   */
  lineSegIntersectsPolygon(u, v, polygon, tolerance) {
    const points = polygon.outline
    const length = points.length
  
    // check if first point is inside the shape (this covers if the line is completely enclosed by the shape)
    if (polygon.outlineContains(u, tolerance)) {
      return true
    }

    // check for intersections for all of the sides
    for (let i = 0; i < length; i ++) {
      const j = (i + 1) % length
      // Originally https://github.com/davidfig/intersects/blob/9fba4c88dcf28998ced7df7c6e744646eac1917d/line-line.js#L23
      if (geom.getLineSegsIntersection(u, v, points[i], points[j]) !== null) {
        return true
      }
    }
    return false
  }

  /**
   * @param {Geom.VectJson} u 
   * @param {Geom.VectJson} v 
   * @param {Geom.Poly} polygon
   */
  lineSegCrossesPolygon(u, v, { outline, holes }) {
    if (this.lineSegCrossesRing(u, v, outline)) return true;
    return holes.some(hole => this.lineSegCrossesRing(u, v, hole));
  }

  /**
   * @param {Geom.VectJson} u 
   * @param {Geom.VectJson} v 
   * @param {Geom.VectJson[]} ring
   */
  lineSegCrossesRing(u, v, ring) {
    if (ring.length === 0) return false;
    let u1 = ring[ring.length - 1];
    for (const v1 of ring) {
      if (this.getLineSegsIntersection(u, v, u1, v1) !== null) {
        return true;
      }
      u1 = v1;
    }
    return false;
  }

  /**
   * https://github.com/davidfig/intersects/blob/master/line-point.js
   * @param {Geom.Vect} u 
   * @param {Geom.Vect} v 
   * @param {Geom.Vect} p 
   * @param {number} [tolerance] Default 1
   * @returns 
   */
  lineSegIntersectsPoint(u, v, p, tolerance = 1) {
    tolerance = tolerance || 1
    return Math.abs(
      u.distanceToSquared(v) - (u.distanceToSquared(p) + v.distanceToSquared(p))
    ) <= tolerance;
  }

  /**
   * Get segment through center along 'x+'.
   * @param {Geom.AngledRect<Geom.Rect>} _ 
   */
  getAngledRectSeg({ angle, rect }) {
    const widthNormal = tempVect.set(Math.cos(angle), Math.sin(angle));
    const heightNormal = tempVect2.set(-Math.sin(angle), Math.cos(angle));
    const src = rect.topLeft.addScaledVector(heightNormal, 0.5 * rect.height);
    return [src, src.clone().addScaledVector(widthNormal, rect.width)];
  }

  /**
   * Compute intersection of two infinite lines i.e.
   * 1. `lambda x. p0 + x * d0`.
   * 2. `lambda x. p1 + x * d1`.
   *
   * If they intersect non-degenerately return solution of (1), else `null`.
   * @param {Geom.VectJson} p0
   * @param {Geom.VectJson} d0
   * @param {Geom.VectJson} p1
   * @param {Geom.VectJson} d1
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
   * If they intersect, return `lambda` in [0, 1] s.t. intersection is
   * `p0 + (p1 - p0) * lambda`, else return `null`.
   * @param {Geom.VectJson} p0
   * @param {Geom.VectJson} p1
   * @param {Geom.VectJson} q0
   * @param {Geom.VectJson} q1
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
   * @param {Geom.Direction} direction : ;
   * @param {0 | 1 | 2 | 3} delta 
   * @returns {Geom.Direction}
   */
  getDeltaDirection(direction, delta) {
    return /** @type {Geom.Direction} */ ((direction + delta) % 4);
  }
  
  /**
   * @param {Geom.Direction} direction : ;
   * @param {'x' | 'y'} axis 
   * @returns {Geom.Direction}
   */
  getFlippedDirection(direction, axis) {
    if (axis === 'x') {// Flip n/s i.e. 0/2
      return direction % 2 === 0
        ? /** @type {Geom.Direction} */ (2 - direction)
        : direction;
    } else {// Flip e/w i.e. 1/3
      return direction % 2 === 1
        ? /** @type {Geom.Direction} */ (4 - direction)
        : direction;
    }
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
   * @typedef LightPolyDef @type {object}
   * @property {Geom.Vect} position Position of light.
   * @property {number} range 
   * @property {Geom.Poly[]} [tris] Triangles defining obstructions
   * @property {Geom.Poly} [exterior] Simple polygon (i.e. ring) we are inside
   * @property {[Geom.Vect, Geom.Vect][]} [extraSegs] Line segs
   */

  /**
   * Compute light polygon.
   * @param {LightPolyDef} def
   */
  lightPolygon({ position: pos, range, tris, exterior, extraSegs }) {
    const lightBounds = new Rect(pos.x - range, pos.y - range, 2 * range, 2 * range);
    const closeTris = tris??[].filter(({ rect }) => lightBounds.intersects(rect));
    const points = new Set(
      closeTris.reduce((agg, { outline }) => agg.concat(outline), /** @type {Geom.Vect[]} */ ([]))
        .concat(exterior?.allPoints??[]),
    );
    const allLineSegs = closeTris.reduce(
      (agg, { outline: [u, v, w] }) => agg.concat([[u, v], [v, w], [w, u]]),
      /** @type {[Geom.Vect, Geom.Vect][]} */ ([]),
    ).concat(
      exterior?.lineSegs??[],
      extraSegs??[],
    );

    // These will be unit directional vectors.
    const dir0 = Vect.zero;
    const dir1 =  Vect.zero;
    const dir2 =  Vect.zero;
    // These will be minimal distances to intersections.
    /** @type {number} */ let dist0;
    /** @type {number} */ let dist1;
    /** @type {number} */ let dist2;
    /** @type {number | null} */ let d = null;
    
    /** Intersections relative to {pos}. @type {Vect[]} */
    const deltas = [];

    for (const point of points) {
      // Project 3 rays from `pos`
      dir1.copy(point).sub(pos).normalize();
      dir0.copy(dir1).rotate(-0.001);
      dir2.copy(dir1).rotate(+0.001);
      dist0 = dist1 = dist2 = range;
      // Detect how far each ray propagates without hitting a line segment
      allLineSegs.forEach(([q0, q1]) => {
        d = this.getLineLineSegIntersect(pos, dir0, q0, q1);
        if (d !== null && d >= 0 && d < dist0) {
          dist0 = d;
        }
        d = this.getLineLineSegIntersect(pos, dir1, q0, q1);
        if (d !== null && d >= 0 && d < dist1) {
          dist1 = d;
        }
        d = this.getLineLineSegIntersect(pos, dir2, q0, q1);
        if (d !== null && d >= 0 && d < dist2) {
          dist2 = d;
        }
      });
      // Append to unsorted light polygon
      deltas.push(
        dir0.clone().scale(dist0),
        dir1.clone().scale(dist1),
        dir2.clone().scale(dist2),
      );
    }

    deltas.sort((p, q) =>
      this.radRange(Math.atan2(q.y, q.x)) - this.radRange(Math.atan2(p.y, p.x))
    );

    return new Poly(deltas.map((p) => p.add(pos)));
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
   * Convert a polygonal rectangle back into a `Rect` and `angle`.
   * We ensure the width is greater than or equal to the height.
   * @param {Geom.Poly} poly
   * @returns {Geom.AngledRect<Geom.Rect>}
   */
  polyToAngledRect(poly) {
    const ps = poly.outline;
    const w = tempVect.copy(ps[1]).sub(ps[0]).length;
    const h = tempVect2.copy(ps[2]).sub(ps[1]).length;

    if (w >= h) {
      return {
        rect: new Rect(ps[0].x, ps[0].y, w, h),
        angle: Math.atan2(tempVect.y, tempVect.x),
      };
    } else {
      return {
        rect: new Rect(ps[1].x, ps[1].y, h, w),
        angle: Math.atan2(tempVect2.y, tempVect2.x),
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

export const geom = new geomService;

/**
 * Aligned to `Geom.Direction`.
 */
 export const directionChars = /** @type {const} */ (['n', 'e', 's', 'w']);
 