import { Vect } from "projects/geom";
import polyParse from 'poly-parse';
import Triangle from 'triangle-wasm';

class TriangleService {

  constructor() {
    /** @type {number} */
    this.offset = 0;
  }

  /**
   * @param {Geom.Poly[]} polys
   */
  async triangulate(polys) {
    await Triangle.init();

    const data = this.polysToTriangulateIO(polys);
    // const data = { pointlist: [-1, -1, 1, -1, 1, 1, -1, 1] };
    const input = Triangle.makeIO(data);
    const output = Triangle.makeIO();

    // console.log('triangulating');
    Triangle.triangulate({ pslg: false, quality: true }, input, output);
    
    const points = /** @type {[number, number][]} */ (this.unflat(output.pointlist));
    const triangles = /** @type {[number, number, number][]} */ (this.unflat(/** @type {number[]} */ (output.trianglelist), 3));
    Triangle.freeIO(input, true);
    Triangle.freeIO(output);

    return { points, triangles };
  }

  /**
   * @param {Geom.Poly[]} polys
   * @returns {import("triangle-wasm").TriangulateIO}
   */
  polysToTriangulateIO(polys) {
    return polyParse(this.polysToDotPolyFormat(polys), { flat: true });
  }

  /**
   * @param {Geom.Poly[]} polys
   * @returns {string}
   */
  polysToDotPolyFormat(polys) {
    const verts = polys.flatMap(x => x.allPoints);
    this.offset = 0;
    const segs = polys.flatMap((poly) => [
      ...this.getCyclicSegs(poly.outline.length),
      ...poly.holes.flatMap(hole => this.getCyclicSegs(hole.length)),
    ]);
    const holePnts = polys.flatMap(poly => poly.holes.map(hole => Vect.average(hole)));
    return [
      `${verts.length} 2 0 0`,
      ...verts.map((p, i) => `${i + 1} ${p.x} ${p.y} 0`),
      `${segs.length} 0`,
      ...segs.map((seg, i) => `${i + 1} ${seg[0]} ${seg[1]}`),
      `${holePnts.length}`,
      ...holePnts.map((p, i) => `${i + 1} ${p.x} ${p.y}`),
      '',
    ].join('\n');
  }

  /**
   * @private
   * @param {number} length 
   * @returns {[number, number][]}
   */
  getCyclicSegs(length) {
    const segs = [...Array(length)].map((_, i) =>
      /** @type {[number, number]} */ ([this.offset + i + 1, this.offset + i + 2])
    );
    this.offset += length;
    return segs;
  }

  /**
   * The opposite of Array.prototype.flat() with depth = 1.
   * Useful to convert one-dimensional arrays [x, y, z, x, y, z] into two-dimensional arrays [[x, y, z], [x, y, z]] i.e. for simplicial complex.
   * https://github.com/brunoimbrizi/array-unflat/blob/main/index.js
   * @private
   * @param {any[]} arr 
   * @param {number} size
   * @returns 
   */
  unflat = (arr, size = 2) => {
    if (!arr) return null;
  
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
