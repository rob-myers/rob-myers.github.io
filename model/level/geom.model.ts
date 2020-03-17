import { Vector2 } from '@model/vec2.model';
import { Poly2 } from '@model/poly2.model';

export function getLineLineSegIntersect(
  p: Vector2,
  d: Vector2,
  /** Line segment q0 -- q1 */
  q0: Vector2,
  q1: Vector2,
) {
  // normal n = (-dy,dx)
  const dx = d.x, dy = d.y, px = p.x, py = p.y,
    // dot products (q0 - p).n and (q1 -p).n
    k1 = (q0.x - px)*-dy + (q0.y - py)*dx, 
    k2 = (q1.x - px)*-dy + (q1.y - py)*dx;
  let dqx, dqy, z, s0, s1;
    
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
 * Compute intersection of two infinite lines i.e.
 * p0 + lambda * d0 and p1 + lambda' * d1.
 * If intersects return a respective lambda, else null.
 */
export function getLinesIntersection(
  p0: Vector2, d0: Vector2,
  p1: Vector2, d1: Vector2,
): null | number {
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
  return  (d1x * (p1y - p0y) - d1y * (p1x - p0x)) / (d0y * d1x - d1y * d0x);
}

export function lightPolygon(
  /** Position of light. */
  pos: Vector2,
  range: number,
  lineSegs: [Vector2, Vector2][],
) {
  // TODO restrict lineSegs to close ones
  const points = new Set(lineSegs.flatMap(x => x));

  // These will be unit directional vectors.
  const dir0 = Vector2.zero;
  const dir1 = Vector2.zero;
  const dir2 = Vector2.zero;
  // These will be minimal distances to intersections.
  let dist0: number, dist1: number, dist2: number;
  let d: number | null = null;
    
  /** Intersections relative to {pos}. */
  const deltas = [] as Vector2[];

  for (const point of points) {
    dir1.copy(point).sub(pos).normalize();
    dir0.copy(dir1).rotate(-0.001);
    dir2.copy(dir1).rotate(+0.001);
    dist0 = dist1 = dist2 = range;
    lineSegs.forEach(([q0, q1]) => {
      d = getLineLineSegIntersect(pos, dir0, q0, q1);
      if (d !== null && d >= 0 && d < dist0) {
        dist0 = d;
      }
      d = getLineLineSegIntersect(pos, dir1, q0, q1);
      if (d !== null && d >= 0 && d < dist1) {
        dist1 = d;
      }
      d = getLineLineSegIntersect(pos, dir2, q0, q1);
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
    radRange(Math.atan2(q.y, q.x)) - radRange(Math.atan2(p.y, p.x))
  );

  return new Poly2(deltas.map((p) => p.add(pos)));
}

/**
 * https://stackoverflow.com/a/2049593/2917822
 */
export function pointInTriangle(pt: Vector2, v1: Vector2, v2: Vector2, v3: Vector2) {
  const d1 = sign(pt, v1, v2);
  const d2 = sign(pt, v2, v3);
  const d3 = sign(pt, v3, v1);
  const hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0);
  const hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0);
  return !(hasNeg && hasPos);
}

/**
 * Force radian to range [0, 2pi).
 */
export function radRange(radian: number) {
  radian %= (2 * Math.PI);
  // if (Math.abs(x) <= 0.001) x = 0;
  return radian >= 0 ? radian : (2 * Math.PI + radian);
}

export function sign (p1: Vector2, p2: Vector2, p3: Vector2,) {
  return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
}
