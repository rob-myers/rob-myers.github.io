import create from 'zustand';
import { devtools } from 'zustand/middleware'
import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

import { KeyedLookup, lookupFromValues } from '@model/generic.model';
import * as Param from '@model/env/env.model';
import * as threeUtil from '@model/three/three.model';
import * as Geom from '@model/geom/geom.model'
import { geomService } from '@model/geom/geom.service';

export interface State {
  loadedGltf: boolean;
  actors: KeyedLookup<ActorMeta>;
  rooms: KeyedLookup<RoomMeta>;
  inners: KeyedLookup<InnerMeta>;
  readonly api: {
    load: () => Promise<void>;
    extractMeshes: (gltf: GLTF) => {
      actors: THREE.Mesh[];
      rooms: THREE.Mesh[];
      inners: THREE.Mesh[];
    };
    computeActorMeta: (inner: THREE.Mesh) => ActorMeta;
    computeInnerMeta: (inner: THREE.Mesh) => InnerMeta;
    computeRoomMeta: (room: THREE.Mesh) => RoomMeta;
    createActor: (name: string) => {
      actorName: string;
      geometry: THREE.BufferGeometry;
      material: THREE.Material;
      children: THREE.Object3D[];
    };
    /**
     * Update child mesh 'navmesh' of supplied `room`,
     * taking any attached Inners into account.
     */
    updateRoomNavmesh: (room: THREE.Mesh) => void;
  };
}

export interface ActorMeta {
  /** Mesh name */
  key: string;
  mesh: THREE.Mesh;
}

/** e.g. `fourway` or `closet` */
export interface RoomMeta {
  /** Mesh name */
  key: string;
  mesh: THREE.Mesh;
  highMesh: THREE.Mesh;
  floor: Geom.Rect;
  walls: Geom.Polygon[];
  /** Base navmesh for room */
  navigable: Geom.Polygon[];
}

/** e.g. `central-table` or `shelves`. */
export interface InnerMeta {
  /** Mesh name */
  key: string;
  mesh: THREE.Mesh;
  /** Outset of base which cannot be walked on */
  unnavigable: Geom.Polygon[];
}

const useStore = create<State>(devtools((set, get) => ({
  actors: {},
  rooms: {},
  inners: {},
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
      const { api } = get();
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader');

      (new GLTFLoader()).load('/rooms.gltf', (gltf) => {

        const { actors, rooms, inners } = api.extractMeshes(gltf);
        const actorMetas = actors.map(actor => api.computeActorMeta(actor));
        const roomMetas = rooms.map(room => api.computeRoomMeta(room));
        const innerMetas = inners.map(inner => api.computeInnerMeta(inner));
        // console.log({ actors, rooms, inners });

        set(_ => ({
          loadedGltf: true,
          actors: lookupFromValues(actorMetas),
          rooms: lookupFromValues(roomMetas),
          inners: lookupFromValues(innerMetas),
        }));
      });
    },

    extractMeshes: (gltf: GLTF) => {
      const actors = [] as THREE.Mesh[];
      const rooms = [] as THREE.Mesh[];
      const inners = [] as THREE.Mesh[];

      gltf.scene.traverse((node) => {
        switch (node.name) {
          case 'actors': {
            actors.push(...node.children.filter(threeUtil.isMeshNode));
            actors.forEach(actor => {
              threeUtil.transformImportedMesh(actor);
              actor.geometry.translate(0, 0, 0.3); // Move actor up
              actor.children.filter(threeUtil.isMeshNode)
                .forEach(child => threeUtil.transformImportedMesh(child));
            });
            break;
          }
          case 'rooms': {
            rooms.push(...node.children.filter(threeUtil.isMeshNode));
            rooms.forEach(room => threeUtil.transformImportedMesh(room));
            node.updateMatrixWorld();
            break;
          }
          case 'inners': {
            inners.push(...node.children.filter(threeUtil.isMeshNode));
            inners.forEach(inner => threeUtil.transformImportedMesh(inner));
            break;
          }
        }
      });
      return { actors, rooms, inners };
    },
    
    computeActorMeta: (mesh) => {
      return {
        key: mesh.name,
        mesh,
      };
    },

    computeInnerMeta: (mesh) => {
      const geometry = geomService.toThreeGeometry(mesh.geometry as THREE.BufferGeometry);
      const basePoly = geomService.projectGeometryXY(mesh, geometry);
      const unnavigable = basePoly.flatMap(x => geomService.outset(x, Param.outsetAmount));

      return {
        key: mesh.name,
        mesh,
        unnavigable,
      };
    },

    computeRoomMeta: (mesh) => {
      // Compute room bounding rect in XY plane
      const floor = Geom.Rect.fromPoints(
        geomService.projectXY(mesh.geometry.boundingBox!.min),
        geomService.projectXY(mesh.geometry.boundingBox!.max),
      );

      // Compute base of walls as list of (multi)polygons
      const geometry = geomService.toThreeGeometry(mesh.geometry as THREE.BufferGeometry);
      const wallsPoly = geomService.projectGeometryXY(mesh, geometry);
      
      // Compute navmesh by cutting outset walls from rect
      const navigablePoly = geomService.cutOut(
        wallsPoly.flatMap(x => geomService.outset(x, Param.outsetAmount)),
        [Geom.Polygon.fromRect(floor)],
      );

      const highMesh = mesh.clone();
      highMesh.geometry = highMesh.geometry.clone();
      highMesh.geometry.scale(1, 1, 3);

      return {
        key: mesh.name,
        mesh,
        highMesh,
        floor,
        walls: wallsPoly,
        navigable: navigablePoly,
      };
    },

    createActor: (name) => {
      const { geometry, material, children } = get().actors['default-bot'].mesh;
      return {
        actorName: name,
        geometry: geometry as THREE.BufferGeometry,
        material: material as THREE.Material, // Could be array?
        children,
      };
    },

    /**
     * Update navmesh attached to a room instance.
     */
    updateRoomNavmesh: (room: THREE.Mesh) => {
      const { inners } = get();
      const { [room.name]: meta } = get().rooms;
      const roomGroup = room.parent!;

      const innerMeshes = roomGroup.children
        // children[0] needed in firefox, why?
        .filter(({ name, children }) =>
          name === Param.innerGroupName && children[0] && threeUtil.isMeshNode(children[0]))
        .map(({ children }) => children[0] as THREE.Mesh);
      const innerMetas = innerMeshes.map(x => inners[x.name]);
      const innerDeltas = innerMeshes.map(x => geomService.projectXY(x.parent!.position));
      // console.log('Computing and attaching navmesh...', room, innerMetas, innerDeltas);

      const navigable = geomService.cutOut(
        innerMetas.flatMap(({ unnavigable }, i) =>
          unnavigable.map(p => p.clone().translate(innerDeltas[i]))),
        meta.navigable.map(p => p.clone()),
      );
      
      const navMesh = new THREE.Group();
      navMesh.name = Param.navmeshGroupName;
      // Each item is a rectangular decomposition of a rectilinear multipolygon
      const navPartitions = navigable.map(part => geomService.computeRectPartition(part));
      navPartitions.forEach(rects => {
        /**
         * Possibly wasteful to create many PlaneGeometry instead of one Mesh.
         * We'll traverse these quads to find instantiated navmesh.
         */
        rects.forEach((rect) => {
          const { cx, cy, width, height } = rect;
          const plane = new THREE.Mesh(new THREE.PlaneGeometry(width, height, 1), threeUtil.navMeshMaterial);
          plane.name = Param.navmeshPlaneName;
          plane.receiveShadow = true;
          plane.position.set(cx, cy, 0);
          navMesh.add(plane);

          /**
           * Nav rects (DEBUG).
           */
          // const lines = geomService.createPolyLine([
          //   rect.nw, rect.ne, rect.se, rect.sw, rect.nw,
          // ].map(p => p.translate(-cx, -cy)), 0.001);
          // plane.add(lines);
        });
      });

      const prevNavmesh = roomGroup.children.find(({ name }) => name === Param.navmeshGroupName);
      prevNavmesh && roomGroup.remove(prevNavmesh);
      roomGroup.add(navMesh);
      roomGroup.updateMatrixWorld();
    },

  },
}), 'geom'));

// Provide direct access to api
Object.assign(useStore, { api: useStore.getState().api });

export default useStore as typeof useStore & { api: State['api'] };
