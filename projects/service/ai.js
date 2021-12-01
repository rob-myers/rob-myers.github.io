import { Poly, Vect } from '../geom';
import { geom } from './geom';
import { recast } from './recast';

class AiService {

  /**
   * @param {string} navKey
   * @param {Poly[]} navPolys
   * @param {Partial<import('../service/recast').INavMeshParameters>} [opts]
   */
  async createNavMesh(navKey, navPolys, opts) {
    await recast.ready();
    if (navPolys.length) {
      const triangulation = geom.polysToTriangulation(navPolys);
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
      return geom.removePathReps(navPath.map(x => x.precision(1)));
    } catch (e) {
      console.error('nav error', e);
      return [];
    }
  }
}

export const ai = new AiService;
