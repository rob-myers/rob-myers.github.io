import { EPSILON } from "../structs/consts";
import Point from "../structs/point";

export enum ZeroOnePos {
  /** n < 0 */
  LT_ZERO,
  /** n = 0 */
  EQ_ZERO,
  /** 0 < n < 1 */
  IN_RANGE,
  /** n = 1 */ 
  EQ_ONE,
  /** n > 1 */
  GT_ONE,
};

export enum OrientationType {
  /** counterclockwise */
  CCW,
  /** co-linear */
  COLLINEAR,
  /** clockwise */ 
	CW,
};

export function get_orientation(
  a: Point,
  b: Point,
  c: Point,
) {
  const cross = ((b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x));
  if (Math.abs(cross) < EPSILON) {
    return OrientationType.COLLINEAR;
  } else if (cross > 0) {
    return OrientationType.CCW;
  } else {
    return OrientationType.CW;
  }
}

/** Detects where `num / denom` lies within the range `[0, 1]`. */
export function line_intersect_bound_check(
  num: number,
  denom: number,
) {
  // Check if `num / denom` is `0`.
  if (Math.abs(num) < EPSILON) {
    return ZeroOnePos.EQ_ZERO;
  }
  /**
   * Check if `num / denom` is `1`.
   * Note: Checking whether it is accurately near 1
   * requires us to check |num - denom| < EPSILON^2 * denom
   * which requires a multiplication. Instead, we can assume
   * that denom is less than 1/EPSILON and check
   * |num - denom| < EPSILON instead.
   * This is less accurate but faster.
   */
  if (Math.abs(num - denom) < EPSILON) {
    return ZeroOnePos.EQ_ONE;
  }

  // Now we finally check whether it's greater than 1 or less than 0.
  if (denom > 0) {
    if (num < 0) {// strictly less than 0
      return ZeroOnePos.LT_ZERO;
    }
    if (num > denom) {// strictly greater than 1
      return ZeroOnePos.GT_ONE;
    }
  } else {
    if (num > 0) {// strictly less than 0
        return ZeroOnePos.LT_ZERO;
    }
    if (num < denom) {// strictly greater than 1
        return ZeroOnePos.GT_ONE;
    }
  }
  return ZeroOnePos.IN_RANGE;
}

/** Reflects the point across the line lr. */
export function reflect_point(
  p: Point,
  l: Point,
  r: Point
) {
  const denom = r.distance_sq(l);

  if (Math.abs(denom) < EPSILON) {
    // A trivial reflection.
    // Should be p + 2 * (l - p) = (2 * l) - p.
    return new Point( (2 * l.x) - p.x, (2 * l.y) - p.y );
  }
  // (r - p) x (l - p)
  const numer = ((r.x - p.x) * (l.y - p.y)) - ((r.y - p.y) * (l.x - p.x));

  // The vector r - l rotated 90 degrees counterclockwise.
  // Can imagine "multiplying" the vector by the imaginary constant.
  const delta_rotated = new Point(l.y - r.y, r.x - l.x);

  // #ifndef NDEBUG
  // // If we're debugging, ensure that p + (numer / denom) * delta_rotated
  // // lies on the line lr.
  // assert(get_orientation(l, p + (numer / denom) * delta_rotated, r) ==
  //        Orientation::COLLINEAR);
  // #endif

  return p.add(delta_rotated.scale(2 * numer / denom));
}

export function is_collinear(a: Point, b: Point, c: Point) {
  return Math.abs(
    ((b.x - a.x) * (c.y - b.y)) - ((b.y - a.y) * (c.x - b.x))
  ) < EPSILON;
}

/**
 * Returns the line intersect between ab and cd as fast as possible.
 * Uses a and b for the parameterisation.
 * ASSUMES NO COLLINEARITY.
 */
export function line_intersect(a: Point, b: Point, c: Point, d: Point) {
  const numer = ((c.x - a.x) * (d.y - a.y) - (c.y - a.y) * (d.x - a.x));
  const denom = ((b.x - a.x) * (d.y - c.y) - (b.y - a.y) * (d.x - c.x));
  return b.scale(numer / denom);
}
