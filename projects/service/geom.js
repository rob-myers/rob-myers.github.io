import { Poly, Vect } from '../geom';
import { recast, INavMeshParameters } from './recast';

class GeomService {
  /**
   * @param {string} navKey
   * @param {Poly[]} navPolys
   * @param {Partial<INavMeshParameters>} [opts]
   */
  async createNavMesh(navKey, navPolys, opts) {
    await recast.ready();
    if (navPolys.length) {
      const triangulation = this.polysToTriangulation(navPolys);
      recast.createNavMesh(navKey, triangulation, opts);
    } else {
      recast.clearNavMesh(navKey);
    }
  }

  /**
   * @param {string} navKey 
   * @param {Geom.VectJson} src
   * @param {Geom.VectJson} dst 
   * @returns {Vect[]}
   */
  requestNavPath(navKey, src, dst) {
    try {
      const navPath = recast.computePath(navKey, src, dst);
      return this.removePathReps(navPath.map(x => x.precision(1)));
    } catch (e) {
      console.error('nav error', e);
      return [];
    }
  }

  /**
   * Join disjoint triangulations
   * @param {Geom.Triangulation[]} triangulations 
   * @returns {Geom.Triangulation}
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
   * @returns {Geom.Triangulation}
   */
  polysToTriangulation(polygons) {
    const decomps = polygons.map(p => p.qualityTriangulate());
    return this.joinTriangulations(decomps);
  }

  /** @param {Vect[]} path */
  removePathReps(path) {
    /** @type {Geom.VectJson} */
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
