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

const scaleFactor = 1 / 5;

export type State = {
  loaded: boolean;
  loading: boolean;
  loadResolvers: (() => void)[];
  /** Mesh library */
  mesh: Record<string, MeshDef>;
  /** Texture library */
  texture: Record<string, THREE.Texture>;

  readonly api: {
    /** Get a clone of specified mesh */
    cloneMesh: (meshName: string) => THREE.Mesh;
    createNavMesh: (navKey: string, polys: Geom.Polygon[]) => {
      bounds: Geom.Rect;
      navPolys: Geom.Polygon[];
    };
    /** Extract meshes from loaded gltf */
    extractMeshes: (gltf: GLTF) => void;
    getMeshDef: (meshName: string) => MeshDef;
    /** Load assets from gltf (exported from Blender). */
    load: () => Promise<void>;
    /** Load images as `THREE.Texture`s */
    loadTextures: () => void;
    requestNavPath: (navKey: string, src: Geom.Vector, dst: Geom.Vector) => Geom.VectorJson[];
  };
}

export interface MeshDef {
  mesh: THREE.Mesh;
  /** Partially transparent clone of `mesh.material` */
  selectedMaterial: THREE.Material;
}

const useStore = create<State>(devtools((set, get) => ({
  loaded: false,
  loading: false,
  loadResolvers: [],
  mesh: {},
  texture: {},

  api: {

    load: async () => {
      if (get().loaded) {
        return;
      } else if (get().loading) {
        return new Promise(resolve => get().loadResolvers.push(resolve));
      }

      set(_ => ({ loading: true }));

      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader');
      const { DRACOLoader } = await import('three/examples/jsm/loaders/DRACOLoader');
      const loader = new GLTFLoader;
      loader.setDRACOLoader((new DRACOLoader).setDecoderPath('/draco/'));
      
      const gltf = await loader.loadAsync('/root.gltf');
      api.extractMeshes(gltf);
      api.loadTextures();

      set(_ => ({ loaded: true, loading: false }));
      while (get().loadResolvers.pop()?.());
    },

    extractMeshes: (gltf: GLTF) => {
      const mesh = {} as State['mesh'];
      gltf.scene.traverse((node) => {
        // console.log('gltf: saw node:', node);
        if (isMeshNode(node)) {
          // Avoid self-shadow issues
          (node.material as THREE.Material).side = THREE.FrontSide;
          // Create transparent clone to indicate selections
          const selectedMaterial = (node.material as THREE.Material).clone();
          selectedMaterial.opacity = 0.5;
          selectedMaterial.transparent = true;
          // Remove translation and scale down
          node.position.set(0, 0, 0);
          node.scale.set(scaleFactor, scaleFactor, scaleFactor);
          mesh[node.name] = {
            mesh: node, 
            selectedMaterial,
          };
        }
      });
      set(_ => ({ mesh }));
    },

    getMeshDef: (meshName) => get().mesh[meshName],

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
      const { mesh } = get().mesh[meshKey];
      return mesh.clone() as THREE.Mesh;
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
