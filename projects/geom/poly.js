import * as poly2tri from 'poly2tri';
import * as polygonClipping from 'polygon-clipping';
import earcut from 'earcut';
import { Rect } from "./rect";
import { Vect } from "./vect";
import { Mat } from './mat';
import { geom } from '../service/geom';

export class Poly {

  /**
   * @private
   * @type {undefined | Poly[]}
   * Avoid costly recomputation when no mutation.
   */
  _triangulation;
  /**
   * @private
   * @type {undefined | [number, number, number][]}
   * Often preserved under mutation.
   */
   _triangulationIds;

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

  get center() {
    return Vect.average(this.allPoints);
  }

  /** @returns {Geom.GeoJsonPolygon} */
  get geoJson() {
    return {
      type: 'Polygon',
      coordinates: [
        this.outline.map(({ x, y }) => /** @type {Geom.Coord} */ ([x, y]))
      ].concat(
        this.holes.map(hole => hole.map(({ x, y }) => [x, y]))
      ),
      ...this.meta && { meta: this.meta  }
    };
  }

  /**
   * Line segs from outline and holes.
   * @returns {[Vect, Vect][]}
   */
  get lineSegs() {
    return [this.outline, ...this.holes].reduce(
      (agg, loop) => agg.concat(loop.map((x, i) => [
        x.clone(),
        loop[(i + 1) % loop.length].clone(),
      ])),
      /** @type {[Vect, Vect][]} */ ([]),
    );
  }

  get rect() {
    return Rect.fromPoints(...this.outline);
  }

  get svgPath() {
    return [this.outline, ...this.holes]
      .map(ring => `M${ring}Z`).join(' ');
  }

  /** Compute tangents of exterior and holes. */
  get tangents() {
    const rings = [this.outline, ...this.holes];
    const [outer, ...inner] = rings.map(ring =>
      // Append first to get final tangent
      ring.concat(ring[0]).reduce(
        (agg, p, i, ps) => {

          if (i) {
            const pointLength = p.clone().sub(ps[i - 1]).length;
            pointLength < 0.01 && console.log('saw point length', pointLength);
          }

          return i > 0 ? agg.concat(p.clone().sub(ps[i - 1]).normalize()) : []
        },
        /** @type {Vect[]} */ ([])
      )
    );
    return { outer, inner };
  }

  get triangulation() {
    if (!this._triangulation) {
      this.fastTriangulate();
      // this.qualityTriangulate();
    }
    return /** @type {Poly[]} */ (this._triangulation);
  }

  /** @param {Geom.VectJson} delta */
  add(delta) {
    return this.translate(delta.x, delta.y);
  }

  /** @param {Record<string, string | undefined>} meta */
  addMeta(meta) {
    this.meta = Object.assign(this.meta || {}, meta);
    return this;
  }

  /**
   * https://stackoverflow.com/a/1165943/2917822
   * - We do not expect final point to be same as the first.
   *   We temporarily ensure it below to ease computation.
   * - Anticlockwise w.r.t. HTMLCanvas coords (x right, y down).
   * - We cannot rely on only 3 points to test orientation,
   *   because they may form an interior or exterior triangle.
   */
  anticlockwise() {
    this.outline.push(this.outline[0]);
    const sum = this.outline.reduce((sum, p, i, ps) => sum + (
      i < ps.length - 1
        ? (ps[i + 1].x - p.x) * (ps[i + 1].y + p.y)
        : 0
    ), 0);
    this.outline.pop();
    return sum > 0;
  }

  /** @param {import('./mat').Mat} m */
  applyMatrix(m) {
    if (!m.isIdentity) {
      this.outline = this.outline.map(p => m.transformPoint(p));
      this.holes.forEach(hole => hole.map(p => m.transformPoint(p)));
      this.clearCache(true);
    }
    return this;
  }

  /**
   * @private
   * @param {[number, number, number][]} indexTriples 
   */
  cache(indexTriples) {
    this._triangulationIds = indexTriples;
    this._triangulation = this.triangleIdsToPolys(this._triangulationIds);
  }
  
  /**
   * @private
   */
  clearCache(clearAll = false) {
    if (clearAll) {
      this._triangulationIds = this._triangulation = undefined;
    } else if (this._triangulationIds?.length) {
      this._triangulation = this.triangleIdsToPolys(this._triangulationIds);
    }
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
   * @param {Geom.VectJson} point 
   * @returns {boolean}
   */
  contains(point) {
    if (!this.rect.contains(point)) {
      return false;
    }
    // NOTE `this.triangulation` uses cache
    return this.triangulation.some(t =>
      Poly.pointInTriangle(point, t.outline[0], t.outline[1], t.outline[2])
    );
  }

  /**
   * https://github.com/davidfig/intersects/blob/master/polygon-point.js
   * polygon-point collision
   * based on https://stackoverflow.com/a/17490923/1955997
   * @param {Geom.VectJson} p point
   * @param {number} [tolerance] maximum distance of point to polygon's edges that triggers collision (see pointLine)
   */
  outlineContains(p, tolerance = 0.1) {
    const points = this.outline;
    const length = points.length
    let c = false
    let i, j
    for (i = 0, j = length - 1; i < length; i++) {
      if (
        (points[i].y > p.y) !== (points[j].y > p.y)
        &&
        (p.x < (points[j].x - points[i].x) * (p.y - points[i].y) / (points[j].y - points[i].y) + points[i].x)
      ) {
        c = !c
      }
      j = i
    }
    if (c) {
      return true
    }
    for (i = 0; i < length; i++) {
      tempPoint1.copy(i === length - 1 ? points[0] : points[i + 1])
      if (geom.lineSegIntersectsPoint(points[i], tempPoint1, tempPoint2.copy(p), tolerance)) {
        return true
      }
    }
    return false
  }

  /**
   * Create a new inset or outset version of this polygon,
   * by cutting/unioning quads.
   * - assume outer points have anticlockwise orientation.
   * - assume holes have clockwise orientation.
   * @param {number} amount
   */
  createInset(amount) {
    if (amount === 0) return [this.clone()];
    this.cleanFinalReps(); // Required

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
      ring.map((_, i) =>
        new Poly([
          ring[i].clone(),
          inset[i],
          inset[(i + 1) % ring.length],
          ring[(i + 1) % ring.length].clone()
        ]))
    );

    if (amount > 0) {// Inset
      return Poly.cutOut(outerQuads.concat(...holesQuads), [this.clone()]);
    } else {// Outset
      return Poly.union([this.clone()].concat(outerQuads, ...holesQuads));
    }
  }

  /** @param {number} amount */
  createOutset(amount) {
    return this.createInset(-amount);
  }

  /**
   * Cut `cuttingPolys` from `polys`.
   * @param {Poly[]} cuttingPolys
   * @param {Poly[]} polys
   */
  static cutOut(cuttingPolys, polys) {
    return polygonClipping
      .difference(
        polys.map(({ geoJson: { coordinates } }) => coordinates),
        ...cuttingPolys.map(({ geoJson: { coordinates } }) => coordinates),
      )
      // .map(coords => Poly.from(coords).cleanFinalReps());
      .map(coords => Poly.from(coords));
  }

  /**
   * Faster but less uniform.
   * Also cannot handle Steiner points.
   * @returns {Geom.Triangulation}
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
    this.cache(indexTriples);
    return { vs: this.allPoints, tris: indexTriples };
  }

  fixOrientation() {
    if (this.anticlockwise()) {
      this.reverse();
    }
    return this;
  }

  /** @param {Geom.GeoJsonPolygon | Geom.GeoJsonPolygon['coordinates']} input  */
  static from(input) {
    if (input instanceof Array) {
      return new Poly(
        input[0].map(([x, y]) => new Vect(x, y)),
        input.slice(1).map(hole => hole.map(([x, y]) => new Vect(x, y)))
      );
    }
    return new Poly(
      input.coordinates[0].map(([x, y]) => new Vect(x, y)),
      input.coordinates.slice(1).map(hole => hole.map(([x, y]) => new Vect(x, y))),
    );
  }

  /** @param {Geom.RectJson} rect  */
  static fromRect(rect) {
    return rect instanceof Rect
      ? new Poly(rect.points)
      : new Poly(Rect.fromJson(rect).points);
  }

  /** @param {Geom.AngledRect<Geom.RectJson>} angled */
  static fromAngledRect(angled) {
    const poly = Poly.fromRect(new Rect(0, 0, angled.baseRect.width, angled.baseRect.height));
    poly.applyMatrix(new Mat().setRotation(angled.angle));
    poly.translate(angled.baseRect.x, angled.baseRect.y);
    return poly;
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
      const lambda = geom.getLinesIntersect(
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

  /**
   * Intersect union of `polys` with union of `others`.
   * @param {Poly[]} polys
   * @param {Poly[]} others
   */
  static intersect(polys, others) {
    return polygonClipping
      .intersection(
        polys.map(({ geoJson: { coordinates } }) => coordinates),
        others.map(({ geoJson: { coordinates } }) => coordinates),
      )
      .map(coords => Poly.from(coords)
    );
  }

  /**
   * @param {Geom.VectJson} pt 
   * @param {Geom.VectJson} v1 
   * @param {Geom.VectJson} v2 
   * @param {Geom.VectJson} v3 
   */
  static pointInTriangle(pt, v1, v2, v3) {
    const d1 = Poly.sign(pt, v1, v2);
    const d2 = Poly.sign(pt, v2, v3);
    const d3 = Poly.sign(pt, v3, v1);
    const hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0);
    const hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0);
    return !(hasNeg && hasPos);
  }

  /**
   * Quality triangulation via constrained delaunay library 'poly2ti'.
   * Can fail for non-wellformed polygons e.g. given square
   * with a hole, cut another hole meeting 1st hole at a point.
   * On failure we fallback to earcut algorithm, warning in console.
   * @returns {Geom.Triangulation}
   */
  qualityTriangulate() {
    try {
      /** @typedef {Geom.VectJson & { id: number }} VWithId */
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
      
      this.cache(tris);
      return { vs: this.allPoints, tris };
    } catch (e) {
      console.error('Quality triangulation failed, falling back to earcut');
      console.error(e);
      return this.fastTriangulate();
    }
  }

  /**
   * Mutate vector precision.
   * @param {number} dp decimal places
   */
  precision(dp) {
    this.outline.forEach(p => p.precision(dp));
    this.holes.forEach(hole => hole.forEach(p => p.precision(dp)));
    this.clearCache();
    return this;
  }

  removeHoles() {
    this.holes = [];
    this.clearCache(true);
    return this;
  }

  reverse() {
    this.outline.reverse();
    this.holes.forEach(hole => hole.reverse());
    return this;
  }

  /** Mutate vectors by rounding. */
  round() {
    this.outline.forEach(p => p.round());
    this.holes.forEach(h => h.forEach(p => p.round()));
    this.clearCache();
    return this;
  }

  /** @param {number} scalar */
  scale(scalar) {
    this.outline.forEach(p => p.scale(scalar));
    this.holes.forEach(h => h.forEach(p => p.scale(scalar)));
    this.clearCache();
    return this;
  }

  /**
   * @param {Geom.VectJson} p1 
   * @param {Geom.VectJson} p2 
   * @param {Geom.VectJson} p3 
   */
  static sign(p1, p2, p3) {
    return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
  }

  /**
   * @param {number} dx 
   * @param {number} dy 
   */
  translate(dx, dy) {
    this.outline.forEach(p => p.translate(dx, dy));
    this.holes.forEach(h => h.forEach(p => p.translate(dx, dy)));
    this.clearCache();
    return this;
  }
  
  /**
   * Construct union of polygons.
   * @param {[number, number, number][]} triIds 
   */
  triangleIdsToPolys(triIds) {
    const ps = this.allPoints;
    return triIds.map(([u, v, w]) => new Poly([ ps[u], ps[v], ps[w] ]));
  }

  /**
   * Construct union of polygons.
   * @param {Poly[]} polys 
   */
  static union(polys) {
    return polygonClipping
      .union([], ...polys.map(({ geoJson: { coordinates } }) => coordinates))
      // .map(coords => Poly.from(coords).cleanFinalReps());
      .map(coords => Poly.from(coords));
  }
  
}

const tempPoint1 = new Vect;
const tempPoint2 = new Vect;
