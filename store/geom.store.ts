import create from 'zustand';
import { devtools } from 'zustand/middleware'
import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

import { KeyedLookup, lookupFromValues } from 'model/generic.model';
import * as threeUtil from 'model/3d/three.model';
import { geomService, outsetBounds, outsetWalls } from 'model/geom.service';
import * as Geom from 'model/geom';
import { recastService } from 'model/3d/recast.service';
import { initStageBounds } from 'model/stage/stage.model';

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
    createNavMesh: (navKey: string, polys: Geom.Polygon[]) => {
      bounds: Geom.Rect;
      navPolys: Geom.Polygon[];
    };
    requestNavPath: (navKey: string, src: Geom.Vector, dst: Geom.Vector) => Geom.VectorJson[];
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

    createNavMesh: (navKey, polys) => {
      const bounds = Geom.Rect.union(
        polys.map(x => x.rect).concat(initStageBounds),
      ).outset(outsetBounds);

      const navPolys = geomService.cutOut(
        polys.flatMap(x => geomService.outset(x, outsetWalls)
          .map(x => x.precision(1))),
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
