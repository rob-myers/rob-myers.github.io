import { Vect } from "../geom/vect";
import Triangle from 'triangle-wasm';

export class TriangleService {

  constructor() {
    /** @type {number} */
    this.offset = 0;
  }

  /**
   * @param {Geom.Poly[]} polys
   * @param {TriangulateOpts} [opts]
   * @returns {Promise<Geom.TriangulationJson>}
   */
  async triangulate(polys, opts) {
    await Triangle.init();

    // const data = { pointlist: [-1, -1, 1, -1, 1, 1, -1, 1] };
    const data = this.polysToTriangulateIO(polys);
    const input = Triangle.makeIO(data);
    const output = Triangle.makeIO();

    // console.log('triangulating');
    Triangle.triangulate({
      pslg: true,
      // quality: opts?.minAngle || true,
      holes: true,
      // holes: false,
      area: opts?.maxArea || false,
      steiner: opts?.maxSteiner,
      // convexHull: true,
      jettison: true,
      ccdt: true,
      refine: false
    }, input, output);
    
    // triangle-wasm uses 0-based indices (unlike .poly file format)
    const points = /** @type {[number, number][]} */ (this.unflat(output.pointlist));
    const vs = points.map(([x, y]) => ({ x, y }));
    const tris = /** @type {[number, number, number][]} */ (
      this.unflat(/** @type {number[]} */ (output.trianglelist), 3).map(triIds => triIds.map(y => y))
    );

    Triangle.freeIO(input, true);
    Triangle.freeIO(output);

    return { vs, tris };
  }

  /**
   * @param {Geom.Poly[]} polys
   * @returns {import("triangle-wasm").TriangulateIO}
   */
  polysToTriangulateIO(polys) {
    const verts = polys.flatMap(x => x.allPoints);

    this.offset = 0;
    const segs = polys.flatMap((poly) => [
      ...this.getCyclicSegs(poly.outline.length),
      ...poly.holes.flatMap(hole => this.getCyclicSegs(hole.length)),
    ]);

    /**
     * Get points inside holes, using 0.01 delta
     * and assuming appropriate clockwise convention.
     * Taking the average vector doesn't always work.
     */
    const holePnts = polys.flatMap(poly =>
      poly.holes.map(([p, q]) => new Vect(
        (q.x + p.x)/2 + +0.01 * (q.y - p.y),
        (q.y + p.y)/2 + -0.01 * (q.x - p.x),
      )),
    );

    return {
      pointlist: verts.flatMap(p => [p.x, p.y]),
      segmentlist: segs.flatMap((seg) => seg),
      holelist: holePnts.flatMap(p => [p.x, p.y]),
    };
  }

  /**
   * @private
   * @param {number} length 
   * @returns {[number, number][]}
   */
  getCyclicSegs(length) {
    if (length < 3) return []; // Ignore degenerate
    const segs = [...Array(length - 1)].map((_, i) =>
      /** @type {[number, number]} */ ([this.offset + i, this.offset + i + 1])
    );
    segs.push([this.offset + length - 1, this.offset]);
    this.offset += length;
    return segs;
  }

  /**
   * The opposite of Array.prototype.flat() with depth = 1.
   * Useful to convert one-dimensional arrays [x, y, z, x, y, z] into two-dimensional arrays [[x, y, z], [x, y, z]] i.e. for simplicial complex.
   * https://github.com/brunoimbrizi/array-unflat/blob/main/index.js
   * @private
   * @template T
   * @param {T[]} arr 
   * @param {number} size
   * @returns {T[][]}
   */
  unflat = (arr, size = 2) => {
    const newArr = [];
    const newLen = arr.length / size;
  
    for (var i = 0; i < newLen; i++) {
      const group = [];
      for (let j = 0; j < size; j++) {
        group.push(arr[i * size + j]);
      }
      newArr.push(group);
    }
    return newArr;
  }

}

export const triangle = new TriangleService;

/**
 * @typedef TriangulateOpts @type {object}
 * @property {boolean | number} [maxArea]
 * @property {boolean | number} [minAngle]
 * @property {number} [maxSteiner]
 */
