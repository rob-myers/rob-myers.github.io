import create from 'zustand';
import { devtools } from 'zustand/middleware'
import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

import { KeyedLookup, lookupFromValues } from 'model/generic.model';
import * as threeUtil from 'model/3d/three.model';
import { geomService, outsetAmount } from 'model/geom.service';
import * as Geom from 'model/geom';
import { recastService } from 'model/3d/recast.service';

export type State = {
  loadedGltf: boolean;
  actors: KeyedLookup<ActorMeshMeta>;

  readonly api: {
    load: () => Promise<void>;
    extractMeshes: (gltf: GLTF) => {
      actors: THREE.Mesh[];
    };
    computeActorMeta: (inner: THREE.Mesh) => ActorMeshMeta;
    createActor: (name: string) => {
      actorName: string;
      geometry: THREE.BufferGeometry;
      material: THREE.Material;
      children: THREE.Object3D[];
    };
    createNavMesh: (polys: Geom.Polygon[]) => void;
    requestNavPath: (src: Geom.Vector, dst: Geom.Vector) => Geom.VectorJson[];
  };
}

export interface ActorMeshMeta {
  /** Mesh name */
  key: string;
  mesh: THREE.Mesh;
}

const useStore = create<State>(devtools((set, get) => ({
  actors: {},
  loadedGltf: false,
  navWorker: null,
  api: {
    /**
     * Load assets from gltf (exported from Blender).
     * Initialize navigation worker.
     */
    load: async () => {
      if (get().loadedGltf) {
        return;
      }

      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader');
      (new GLTFLoader()).load('/root.gltf', (gltf) => {
        const { actors } = api.extractMeshes(gltf);
        const actorMetas = actors.map(actor => api.computeActorMeta(actor));
        // console.log({ actors, rooms, inners });

        set(_ => ({
          loadedGltf: true,
          actors: lookupFromValues(actorMetas),
        }));
      });
    },

    extractMeshes: (gltf: GLTF) => {
      const actors = [] as THREE.Mesh[];
      gltf.scene.traverse((node) => {
        switch (node.name) {
          case 'actors': {
            actors.push(...node.children.filter(threeUtil.isMeshNode));
            actors.forEach(actor => {
              threeUtil.transformImportedMesh(actor);
              actor.geometry.translate(0, 0, 0.2); // Move actor up
              actor.children.filter(threeUtil.isMeshNode)
                .forEach(child => threeUtil.transformImportedMesh(child));
            });
            break;
          }
        }
      });
      return { actors };
    },

    createActor: (name) => {
      // TODO remove hard-coding
      const { geometry, material, children } = get().actors['default-bot'].mesh;
      return {
        actorName: name,
        geometry: geometry as THREE.BufferGeometry,
        material: material as THREE.Material, // Could be array?
        children,
      };
    },
    computeActorMeta: (mesh) => {
      return {
        key: mesh.name,
        mesh,
      };
    },

    createNavMesh: (polys) => {
      const floor = Geom.Rect.union(polys.map(x => x.rect));

      const navPolys = geomService.cutOut(
        polys.flatMap(x => geomService.outset(x, outsetAmount)),
        [Geom.Polygon.fromRect(floor)],
      );
      const navMesh = geomService.polysToMesh(
        navPolys,
        new THREE.MeshNormalMaterial({ side: THREE.DoubleSide }),
      );
      // Only supports one nav mesh at a time
      recastService.createNavMesh(navMesh);
    },

    requestNavPath: (src: Geom.VectorJson, dst: Geom.VectorJson) => {
      try {
        const src3 = new THREE.Vector3(src.x, src.y);
        const dst3 = new THREE.Vector3(dst.x, dst.y);
        const navPath = recastService.computePath(src3, dst3);
        return geomService.removePathReps(
          [src].concat(navPath.map(({ x, y }) => ({ x, y }))));
        
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
