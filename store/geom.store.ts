/**
 * We'll use this store to import gltfs and create navmeshes.
 */
import create from 'zustand';
import { devtools } from 'zustand/middleware'
import * as THREE from 'three';

import * as Geom from 'model/geom';
import { geom } from 'model/geom.service';
import { recastService } from 'model/3d/recast.service';
import { vectPrecision } from 'model/3d/three.model';

export type State = {
  /** Texture library */
  texture: Record<string, THREE.Texture>;

  readonly api: {
    /** Create a navigation mesh using recast */
    createNavMesh: (navKey: string, polys: Geom.Polygon[]) => Promise<void>;
    /** Request a navpath from previously created navmesh */
    requestNavPath: (navKey: string, src: Geom.VectorJson, dst: Geom.VectorJson) => Geom.VectorJson[];
  };
}

export interface MeshDef {
  mesh: THREE.Mesh;
}

const useStore = create<State>(devtools((set, get) => ({
  texture: {},

  api: {

    createNavMesh: async (navKey, navPolys) => {
      await recastService.ready();
      if (navPolys.length) {
        const geometry = geom.polysToGeometry(navPolys, 'xz');
        recastService.createNavMesh(navKey, geometry);
      } else {
        recastService.clearNavMesh(navKey);
      }
    },

    requestNavPath: (navKey, src, dst) => {
      try {
        const src3 = new THREE.Vector3(src.x, 0, src.y);
        const dst3 = new THREE.Vector3(dst.x, 0, dst.y);
        const navPath = recastService.computePath(navKey, src3, dst3)
          .map(x => vectPrecision(x, 2));
        return geom.removePathReps(
          [{ x: src.x, y: src.y }].concat(navPath.map(({ x, z: y }) => ({ x, y })))
        );
      } catch (e) {
        console.error('nav error', e);
        return [];
      }
    },
  },
}), 'geom'));

const api = useStore.getState().api;
const useGeomStore = Object.assign(useStore, { api });

export default useGeomStore;
