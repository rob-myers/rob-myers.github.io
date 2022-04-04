export class Utils {

  /**
   * @param {number} value 
   * @param {number} decimals 
   */
  static roundNumber (value, decimals) {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }

  /** @param {any[]} list */
  static sample (list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  /**
   * @param {Geom.VectJson} a 
   * @param {Geom.VectJson} b 
   */
  static distanceToSquared (a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy;
  }

  /**
   * Jonas Raoni Soares Silva
   * http://jsfromhell.com/math/is-point-in-poly [rev. #0]
   * @param {Geom.VectJson[]} poly 
   * @param {Geom.VectJson} pt 
   * @returns 
   */
  static isPointInPoly (poly, pt) {
    for (
      var c = false, i = -1, l = poly.length, j = l - 1;
      ++i < l;
      j = i
    )
      (
        (poly[i].y <= pt.y && pt.y < poly[j].y)
        || (poly[j].y <= pt.y && pt.y < poly[i].y)
      ) && (
        pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x
      ) && (
        c = !c
      );
    return c;
  }

  /**
   * This is `this.isPointInPoly` plus an optimization i.e.
   * first check if vector.y projects into the polygon's y-interval.
   * @param {Geom.VectJson} vector The vector to test against
   * @param {{ vertexIds: number[]}} polygon E.g. the triangle defining a nav node
   * @param {Geom.VectJson[]} vertices Reference to the actual vector
   */
  static isVectorInPolygon (vector, polygon, vertices) {
    let lowestPoint = Infinity;
    let highestPoint = -Infinity;
    let polygonVertices = /** @type {Geom.VectJson[]} */ ([]);

    polygon.vertexIds.forEach((vId) => {
      lowestPoint = Math.min(vertices[vId].y, lowestPoint);
      highestPoint = Math.max(vertices[vId].y, highestPoint);
      polygonVertices.push(vertices[vId]);
    });

    if (vector.y < highestPoint + 0.5 && vector.y > lowestPoint - 0.5 &&
      this.isPointInPoly(polygonVertices, vector)) {
      return true;
    }
    return false;
  }

  /**
   * We had to negate the [original function](https://github.com/donmccurdy/three-pathfinding/blob/cd985050fd8286c3df006543c9272e02fffaacd1/src/Utils.js#L55)
   * presumably because our polygon-orientation-convention differs.
   * We assume outer polygons (e.g. triangles) are clockwise w.r.t. (x right, y down).
   * @param {Geom.VectJson} a 
   * @param {Geom.VectJson} b 
   * @param {Geom.VectJson} c 
   */
  static triarea2 (a, b, c) {
    var ax = b.x - a.x;
    var az = b.y - a.y;
    var bx = c.x - a.x;
    var bz = c.y - a.y;
    // return bx * az - ax * bz;
    return -(bx * az - ax * bz);
  }

  /**
   * @param {Geom.VectJson} a 
   * @param {Geom.VectJson} b 
   */
  static vequal (a, b) {
    return this.distanceToSquared(a, b) < 0.00001;
  }

}
