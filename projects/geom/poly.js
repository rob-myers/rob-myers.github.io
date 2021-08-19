import * as poly2tri from 'poly2tri';
import * as polygonClipping from 'polygon-clipping';
import earcut from 'earcut';

import { Rect } from "./rect";
import { Coord, VectJson, GeoJsonPolygon } from "./types";
import { Vect } from "./vect";

export class Poly {
  /**
   * @param {Vect[]} outline
   * @param {Vect[][]} holes 
   */
  constructor(outline = [], holes = []) {
    /** @type {Vect[]} */ this.outline = outline;
    /** @type {Vect[][]} */ this.holes = holes;
  }

  get allPoints() {
    return this.outline.concat(...this.holes);
  }

  /**
   * Ensure final point of each ring doesn't equal 1st point.
   * Such loops arise e.g. from npm module 'polygon-clipping',
   * but are unsupported by npm module 'poly2tri'.
   */
  cleanFinalReps() {
    for (const ring of [this.outline, ...this.holes]) {
      const last = ring.pop();
      if (last && !last.equals(ring[0])) {
        ring.push(last);
      }
    }
    return this;
  }

  clone() {
    const outline = this.outline.map(p => p.clone());
    const holes = this.holes.map(hole => hole.map(p => p.clone()));
    return new Poly(outline, holes);
  }

  /**
   * Create a new inset or outset version of this polygon,
   * by cutting/unioning quads.
   * - assume outer points have anticlockwise orientation.
   * - assume holes have clockwise orientation.
   * @param {number} amount
   */
  createInset(amount) {
    if (amount === 0) {
      return [this.clone()];
    }

    // Compute 4-gons inset or outset along edge normals by `amount`
    const [outerQuads, ...holesQuads] = [
      {
        ring: this.outline,
        inset: Poly.insetRing(this.outline, amount),
      },
      ...this.holes.map(ring => ({
        ring,
        inset: Poly.insetRing(ring, amount),
      }))
    ].map(({ ring, inset }) =>
      ring.map(
        (_, i) =>
          new Poly([
            ring[i].clone(),
            inset[i],
            inset[(i + 1) % ring.length],
            ring[(i + 1) % ring.length].clone()
          ])
      )
    );

    if (amount > 0) {// Inset
      return Poly.cutOut(outerQuads.concat(...holesQuads), [this.clone()]);
    } // Otherwise we outset
    return Poly.union([this.clone()].concat(outerQuads, ...holesQuads));
  }

  /** @param {number} amount */
  createOutset(amount) {
    return this.createInset(-amount);
  }

  /**
   * Cut `cuttingPolys` from `polys`.
   * @private
   * @param {Poly[]} cuttingPolys
   * @param {Poly[]} polys
   */
  static cutOut(cuttingPolys, polys) {
    return polygonClipping
      .difference(
        polys.map(({ geoJson: { coordinates } }) => coordinates),
        ...cuttingPolys.map(({ geoJson: { coordinates } }) => coordinates),
      )
      .map(coords => Poly.from(coords).cleanFinalReps());
  }

  // get edges() {
  //   return {
  //     outline: this.outline.map((p, i, ps) => new Edge(p, ps[(i + 1) % ps.length])),
  //     holes: this.holes.map(hole => hole.map((p, i, ps) => new Edge(p, ps[(i + 1) % ps.length]))),
  //   };
  // }

  /**
   * Faster but less uniform.
   * Also cannot handle Steiner points.
   */
  fastTriangulate() {
    const { coordinates } = this.geoJson;
    const data = earcut.flatten(coordinates);
    const triIds = earcut(data.vertices, data.holes, 2);
    const indexTriples = triIds.reduce(
      (agg, vertexIndex, i) =>
        i % 3 === 2
          ? agg.concat([[triIds[i - 2], triIds[i - 1], vertexIndex]])
          : agg,
      /** @type {[number, number, number][]} */ ([]),
    );
    return { vs: this.allPoints, tris: indexTriples };
  }

  /** @param {GeoJsonPolygon | GeoJsonPolygon['coordinates']} input  */
  static from(input) {
    if (input instanceof Array) {
      return new Poly(
        input[0].map(([x, y]) => new Vect(x, y)),
        input.slice(1).map(hole => hole.map(([x, y]) => new Vect(x, y)))
      );
    }
    return new Poly(
      input.coordinates[0].map(([x, y]) => new Vect(x, y)),
      input.coordinates.slice(1).map(hole => hole.map(([x, y]) => new Vect(x, y)))
    );
  }

  /** @param {Rect} rect  */
  static fromRect(rect) {
    return new Poly(rect.points);
  }

  /** @returns {GeoJsonPolygon} */
  get geoJson() {
    return {
      type: 'Polygon',
      coordinates: [
        this.outline.map(({ x, y }) => /** @type {Coord} */ ([x, y]))
      ].concat(
        this.holes.map(hole => hole.map(({ x, y }) => [x, y]))
      ),
    };
  }

  /**
   * Compute intersection of two infinite lines i.e.
   * 1. `lambda x. p0 + x * d0`.
   * 2. `lambda x. p1 + x * d1`.
   *
   * If they intersect non-degenerately return solution of (1), else `null`.
   * @private
   * @param {Vect} p0
   * @param {Vect} d0
   * @param {Vect} p1
   * @param {Vect} d1
   * @returns {number | null}
   */
  static getLinesIntersection(p0, d0, p1, d1) {
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
   * Inset/outset a ring by amount.
   * @private
   * @param {Vect[]} ring 
   * @param {number} amount 
   * @returns {Vect[]}
   */
  static insetRing(ring, amount) {
    const poly = new Poly(ring);
    const tangents = poly.tangents.outer;
    const edges = ring.map((p, i) => /** @type {[Vect, Vect]} */ ([
      p.clone().translate(amount * -tangents[i].y, amount * tangents[i].x),
      ring[(i + 1) % ring.length].clone().translate(amount * -tangents[i].y, amount * tangents[i].x)
    ]));
    return edges.map((edge, i) => {
      const nextIndex = (i + 1) % edges.length;
      const nextEdge = edges[nextIndex];
      const lambda = Poly.getLinesIntersection(
        edge[1],
        tangents[i],
        nextEdge[0],
        tangents[nextIndex]
      );
      return lambda
        ? edge[1].translate(lambda * tangents[i].x, lambda * tangents[i].y)
        : Vect.average([edge[1], nextEdge[0]]); // Fallback
    });
  }

  /** @type {GeoJsonPolygon} */
  get json() {
    return {
      type: 'Polygon',
      coordinates: [
        this.outline.map(({ x, y }) => [x, y]),
        ...this.holes.map(hole => hole.map(({ x, y }) => /** @type {Coord} */ ([x, y])))
      ],
    };
  }

  /**
   * Quality triangulation via constrained delaunay library 'poly2ti'.
   * Can fail for non-wellformed polygons e.g. given square
   * with a hole, cut another hole meeting 1st hole at a point.
   * On failure we fallback to earcut algorithm, warning in console.
   */
  qualityTriangulate() {
    try {
      /** @typedef {VectJson & { id: number }} VWithId */
      const outline = this.outline.map(({ x, y }, id) => /** @type {VWithId} */ ({ x, y, id }));
      let nextId = outline.length;
      const holes = this.holes
        .map(hole => hole.map(({ x, y }) => /** @type {VWithId} */ ({ x, y, id: nextId++ })));

      const tris = new poly2tri.SweepContext(outline)
        .addHoles(holes)
        // Seen failures, but cdt2d handles steiner points
        // .addPoints(this.steinerPoints)
        .triangulate()
        .getTriangles()
        .map(t => /** @type {[VWithId, VWithId, VWithId]} */ ([t.getPoint(0), t.getPoint(1), t.getPoint(2)]))
        .map(([u, v, w]) => /** @type {[number, number, number]} */ ([u.id, v.id, w.id]));
      
      return { vs: this.allPoints, tris };
    } catch (e) {
      console.error('Quality triangulation failed, falling back to earcut');
      console.error(e);
      return this.fastTriangulate();
    }
  }

  /**
   * @param {Vect} pt 
   * @param {Vect} v1 
   * @param {Vect} v2 
   * @param {Vect} v3 
   */
  static pointInTriangle(pt, v1, v2, v3) {
    const d1 = Poly.sign(pt, v1, v2);
    const d2 = Poly.sign(pt, v2, v3);
    const d3 = Poly.sign(pt, v3, v1);
    const hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0);
    const hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0);
    return !(hasNeg && hasPos);
  }

  get rect() {
    return Rect.from(...this.outline);
  }

  round() {
    this.outline.forEach(p => p.round());
    this.holes.forEach(h => h.forEach(p => p.round()));
    return this;
  }

  /** @param {number} scalar */
  scale(scalar) {
    this.outline.forEach(p => p.scale(scalar));
    this.holes.forEach(h => h.forEach(p => p.scale(scalar)));
    return this;
  }

  /**
   * @param {Vect} p1 
   * @param {Vect} p2 
   * @param {Vect} p3 
   */
  static sign (p1, p2, p3) {
    return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
  }

  /**
   * Compute tangents of exterior and holes.
   */
  get tangents() {
    const rings = [this.outline, ...this.holes];
    const [outer, ...inner] = rings.map(ring =>
      // Append first to get final tangent
      ring.concat(ring[0]).reduce(
        (agg, p, i, ps) =>
          i > 0
            ? agg.concat(
              p
                .clone()
                .sub(ps[i - 1])
                .normalize()
            )
            : [],
        /** @type {Vect[]} */ ([])
      )
    );
    return { outer, inner };
  }

  /** @param {Vect} delta */
  translate(delta) {
    this.outline.forEach(p => p.translate(delta.x, delta.y));
    this.holes.forEach(h => h.forEach(p => p.translate(delta.x, delta.y)));
    return this;
  }

  /**
   * Construct union of polygons.
   * @param {Poly[]} polys 
   */
  static union(polys) {
    return polygonClipping
      .union([], ...polys.map(({ geoJson: { coordinates } }) => coordinates))
      .map(coords => Poly.from(coords).cleanFinalReps());
  }
  
}