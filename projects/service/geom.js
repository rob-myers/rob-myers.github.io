import { Triangulation, VectJson } from '../geom/types';
import { Poly, Vect } from '../geom';
import { recastService } from './recast';

class GeomService {
  /**
   * @param {string} navKey 
   * @param {Poly[]} navPolys 
   */
  async createNavMesh(navKey, navPolys) {
    await recastService.ready();
    if (navPolys.length) {
      const geometry = this.polysToTriangulation(navPolys);
      recastService.createNavMesh(navKey, geometry);
    } else {
      recastService.clearNavMesh(navKey);
    }
  }

  /**
   * @param {string} navKey 
   * @param {VectJson} src
   * @param {VectJson} dst 
   * @returns {VectJson[]}
   */
  requestNavPath(navKey, src, dst) {
    try {
      const navPath = recastService.computePath(navKey, src, dst).map(x => x.precision(2));
      return this.removePathReps([{ x: src.x, y: src.y }].concat(navPath));
    } catch (e) {
      console.error('nav error', e);
      return [];
    }
  }

  /**
   * Join disjoint triangulations
   * @param {Triangulation[]} triangulations 
   * @returns {Triangulation}
   */
  joinTriangulations(triangulations) {
    if (triangulations.length === 1) return triangulations[0];
    const vs = /** @type {Vect[]} */ [];
    const tris = /** @type {[number, number, number][]} */ ([]);
    let offset = 0;
    for (const decomp of triangulations) {
      vs.push(...decomp.vs);
      tris.push(...decomp.tris.map(tri => /** @type {[number, number, number]} */ (tri.map(x => x += offset))));
      offset += decomp.vs.length;
    }
    return { vs, tris };
  }

  /**
   * @param {Poly[]} polygons 
   * @returns {Triangulation}
   */
  polysToTriangulation(polygons) {
    const decomps = polygons.map(p => p.qualityTriangulate());
    return this.joinTriangulations(decomps);
  }

  /** @param {VectJson[]} path */
  removePathReps(path) {
    /** @type {VectJson} */
    let prev;
    return path.reduce((agg, p) => {
      if (!(prev && (p.x === prev.x) && (p.y === prev.y))) {
        agg.push(prev = p);
      }
      return agg;
    }, /** @type {typeof path} */ ([]));
  }
}

export const geom = new GeomService;
