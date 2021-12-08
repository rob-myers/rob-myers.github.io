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
   * @returns {Promise<import("triangle-wasm").TriangulateIO>}
   */
  async triangulate(polys) {
    // const d = this.polysToTriangulateIO(polys.slice(0, 1));
    // console.log(d);
    
    await Triangle.init();
    const data = this.polysToTriangulateIO(polys.slice(0, 1));
    // const data = { pointlist: [-1, -1, 1, -1, 1, 1, -1, 1] };
    const input = Triangle.makeIO(data);
    const output = Triangle.makeIO();
    console.log('triangulating');
    Triangle.triangulate({ pslg: false, quality: true }, input, output);
    return output;
    // TODO
    // Triangle.freeIO(input, true);
    // Triangle.freeIO(output);
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
}

export const triangle = new TriangleService;
