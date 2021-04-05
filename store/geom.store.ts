import create from 'zustand';
import { devtools } from 'zustand/middleware'
import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

import { geomService, outsetBounds, outsetWalls } from 'model/geom.service';
import * as Geom from 'model/geom';
import { recastService } from 'model/3d/recast.service';
import { initStageBounds } from 'model/stage/stage.model';

import thinPlusPng from '../3d/img/thin-plus.png';
import { isMeshNode } from 'model/3d/three.model';

export type State = {
  loaded: boolean;
  loading: boolean;
  mesh: Record<string, THREE.Mesh>;
  texture: Record<string, THREE.Texture>;

  readonly api: {
    /** Get a clone of specified mesh */
    cloneMesh: (meshKey: string) => THREE.Mesh;
    createNavMesh: (navKey: string, polys: Geom.Polygon[]) => {
      bounds: Geom.Rect;
      navPolys: Geom.Polygon[];
    };
    /** Extract meshes from loaded gltf */
    extractMeshes: (gltf: GLTF) => void;
    /** Load assets from gltf (exported from Blender). */
    load: () => Promise<void>;
    /** Load images as `THREE.Texture`s */
    loadTextures: () => void;
    requestNavPath: (navKey: string, src: Geom.Vector, dst: Geom.Vector) => Geom.VectorJson[];
  };
}

const useStore = create<State>(devtools((set, get) => ({
  loaded: false,
  loading: false,
  mesh: {},
  texture: {},

  api: {

    load: async () => {
      if (get().loaded || get().loading) return;
      set(_ => ({ loading: true }));

      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader');
      const { DRACOLoader } = await import('three/examples/jsm/loaders/DRACOLoader');
      const loader = new GLTFLoader;
      loader.setDRACOLoader((new DRACOLoader).setDecoderPath('/draco/'));
      
      const gltf = await loader.loadAsync('/root.gltf');
      api.extractMeshes(gltf);
      api.loadTextures();

      set(_ => ({ loaded: true, loading: false }));
    },

    extractMeshes: (gltf: GLTF) => {
      const mesh = {} as State['mesh'];
      gltf.scene.traverse((node) => {
        // console.log('gltf: saw node:', node);
        if (isMeshNode(node)) {
          mesh[node.name] = node;
        }
      });
      set(_ => ({ mesh }));
    },

    loadTextures: () => {
      const textureLoader = new THREE.TextureLoader;
      set(_ => ({
        texture: {
          thinPlusPng: textureLoader.load(thinPlusPng),
        },
      }));
    },

    createNavMesh: (navKey, polys) => {
      const bounds = Geom.Rect.union(
        polys.map(x => x.rect).concat(initStageBounds),
      ).outset(outsetBounds);

      const navPolys = geomService.cutOut(
        polys.flatMap(x => geomService.outset(x, outsetWalls)),
        [Geom.Polygon.fromRect(bounds)],
      );
      // console.log({ bounds, navPolys });

      // Non-blocking creation of recast navmesh
      const geometry = geomService.polysToGeometry(navPolys, 'xz');
      setTimeout(() => recastService.createNavMesh(navKey, geometry));
      return { bounds, navPolys };
    },

    cloneMesh: (meshKey) => {
      return get().mesh[meshKey].clone() as THREE.Mesh;
    },

    requestNavPath: (navKey, src, dst) => {
      try {
        const src3 = new THREE.Vector3(src.x, src.y);
        const dst3 = new THREE.Vector3(dst.x, dst.y);
        const navPath = recastService.computePath(navKey, src3, dst3);
        return geomService.removePathReps(
          [src.json].concat(navPath.map(({ x, y }) => ({ x, y })))
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
