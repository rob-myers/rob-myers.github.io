import { Poly, Rect, Vect } from "../geom";
import { geom } from "../service";

/**
 * Compute light polygon.
 * @param {Geom.Vect} pos Position of light.
 * @param {number} range 
 * @param {Geom.Poly[]} tris Each polygon must be a triangle.
 * @returns 
 */
export function lightPolygon(pos, range, tris) {
  const lightBounds = new Rect(pos.x - range, pos.y - range, 2 * range, 2 * range);
  const closeTris = tris.filter(({ rect }) => lightBounds.intersects(rect));
  const points = new Set(
    closeTris.reduce(
      (agg, { outline }) => agg.concat(outline),
      /** @type {Geom.Vect[]} */ ([]),
    )
  );
  const lineSegs = closeTris.reduce(
    (agg, { outline: [u, v, w] }) => agg.concat([[u, v], [v, w], [w, u]]),
    /** @type {[Geom.Vect, Geom.Vect][]} */ ([]),
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
    dir1.copy(point).sub(pos).normalize();
    dir0.copy(dir1).rotate(-0.001);
    dir2.copy(dir1).rotate(+0.001);
    dist0 = dist1 = dist2 = range;
    lineSegs.forEach(([q0, q1]) => {
      d = geom.getLineLineSegIntersect(pos, dir0, q0, q1);
      if (d !== null && d >= 0 && d < dist0) {
        dist0 = d;
      }
      d = geom.getLineLineSegIntersect(pos, dir1, q0, q1);
      if (d !== null && d >= 0 && d < dist1) {
        dist1 = d;
      }
      d = geom.getLineLineSegIntersect(pos, dir2, q0, q1);
      if (d !== null && d >= 0 && d < dist2) {
        dist2 = d;
      }
    });
    deltas.push(
      dir0.clone().scale(dist0),
      dir1.clone().scale(dist1),
      dir2.clone().scale(dist2),
    );
  }

  deltas.sort((p, q) =>
    geom.radRange(Math.atan2(q.y, q.x)) - geom.radRange(Math.atan2(p.y, p.x))
  );

  return new Poly(deltas.map((p) => p.add(pos)));
}
