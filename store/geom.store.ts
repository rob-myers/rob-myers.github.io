import create from 'zustand';
import { devtools } from 'zustand/middleware'
import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

import { geomService, outsetBounds, outsetWalls } from 'model/geom.service';
import * as Geom from 'model/geom';
import { recastService } from 'model/3d/recast.service';
import { initStageBounds } from 'model/stage/stage.model';

import redCrossPng from '3d/img/red-cross.png';
import { TextureLoader } from 'three';

export type State = {
  loaded: boolean;
  loading: boolean;
  texture: Record<string, THREE.Texture>;
  // actors: KeyedLookup<ActorMeshMeta>;

  readonly api: {
    /** Load assets from gltf (exported from Blender). */
    load: () => Promise<void>;
    extractMeshes: (gltf: GLTF) => {};
    // createActor: (name: string) => {
    //   actorName: string;
    //   geometry: THREE.BufferGeometry;
    //   material: THREE.Material;
    //   children: THREE.Object3D[];
    // };
    createNavMesh: (navKey: string, polys: Geom.Polygon[]) => {
      bounds: Geom.Rect;
      navPolys: Geom.Polygon[];
    };
    requestNavPath: (navKey: string, src: Geom.Vector, dst: Geom.Vector) => Geom.VectorJson[];
  };
}

const useStore = create<State>(devtools((set, get) => ({
  actors: {},
  loaded: false,
  loading: false,
  texture: {},

  api: {

    load: async () => {
      if (get().loaded || get().loading) {
        return;
      }
      set(_ => ({ loading: true }));

      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader');
      const { DRACOLoader } = await import('three/examples/jsm/loaders/DRACOLoader');
      const loader = new GLTFLoader;
      loader.setDRACOLoader((new DRACOLoader).setDecoderPath('/draco/'));

      const gltf = await loader.loadAsync('/root.gltf');
      const { } = api.extractMeshes(gltf);

      const textureLoader = new TextureLoader;
      set(_ => ({
        texture: {
          redCross: textureLoader.load(redCrossPng),
        },
      }));

      set(_ => ({
        loaded: true,
        loading: false,
      }));
    },

    extractMeshes: (gltf: GLTF) => {
      gltf.scene.traverse((node) => {
        console.log('gltf: saw node:', node);
      });
      return {};
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
