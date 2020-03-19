import { Vector2 } from '@model/vec2.model';

export interface NavPortal {
  left: Vector2;
  right: Vector2;
}

/**
 * https://github.com/mikewesthad/navmesh/blob/master/packages/navmesh/src/channel.js
 */
class NavChannel {

  public static stringPull(portals: NavPortal[]) {
    const pts = [];
    // Init scan state
    let portalApex, portalLeft, portalRight;
    let apexIndex = 0, leftIndex = 0, rightIndex = 0;

    portalApex = portals[0].left;
    portalLeft = portals[0].left;
    portalRight = portals[0].right;

    // Add start point.
    pts.push(portalApex);

    for (let i = 1; i < portals.length; i++) {
      // Find the next portal vertices
      const { left, right } = portals[i];

      // Update right vertex.
      if (triarea2(portalApex, portalRight, right) <= 0.0) {
        if (portalApex.equals(portalRight) || triarea2(portalApex, portalLeft, right) > 0.0) {
          // Tighten the funnel.
          portalRight = right;
          rightIndex = i;
        } else {
          // Right vertex just crossed over the left vertex, so the left vertex should
          // now be part of the path.
          pts.push(portalLeft);

          // Restart scan from portal left point.

          // Make current left the new apex.
          portalApex = portalLeft;
          apexIndex = leftIndex;
          // Reset portal
          portalLeft = portalApex;
          portalRight = portalApex;
          leftIndex = apexIndex;
          rightIndex = apexIndex;
          // Restart scan
          i = apexIndex;
          continue;
        }
      }

      // Update left vertex.
      if (triarea2(portalApex, portalLeft, left) >= 0.0) {
        if (portalApex.equals(portalLeft) || triarea2(portalApex, portalRight, left) < 0.0) {
          // Tighten the funnel.
          portalLeft = left;
          leftIndex = i;
        } else {
          // Left vertex just crossed over the right vertex, so the right vertex should
          // now be part of the path
          pts.push(portalRight);

          // Restart scan from portal right point.

          // Make current right the new apex.
          portalApex = portalRight;
          apexIndex = rightIndex;
          // Reset portal
          portalLeft = portalApex;
          portalRight = portalApex;
          leftIndex = apexIndex;
          rightIndex = apexIndex;
          // Restart scan
          i = apexIndex;
          continue;
        }
      }
    }

    if (pts.length === 0 || !pts[pts.length - 1].equals(portals[portals.length - 1].left)) {
      // Append last point to path.
      pts.push(portals[portals.length - 1].left);
    }

    return pts;
  }
}

export default NavChannel;

/**
 * Twice the signed area of the triangle formed by a, b and c
 */
function triarea2(a: Vector2, b: Vector2, c: Vector2) {
  const ax = b.x - a.x;
  const ay = b.y - a.y;
  const bx = c.x - a.x;
  const by = c.y - a.y;
  return -(bx * ay - ax * by);
}
