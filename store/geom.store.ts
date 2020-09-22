import create from 'zustand';
import { devtools } from 'zustand/middleware'
import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

import { KeyedLookup, lookupFromValues } from '@model/generic.model';
import { isMeshNode } from '@model/three/three.model';
import * as Geom from '@model/geom/geom.model'
import { geomService } from '@model/geom/geom.service';
import { innerGroupName, navmeshGroupName, navMeshMaterial, outsetAmount, navmeshPlaneName } from '@model/env/env.model';
import useEnvStore from './env.store'

export interface State {
  loadedGltf: boolean;
  rooms: KeyedLookup<RoomMeta>;
  inners: KeyedLookup<InnerMeta>;
  api: {
    load: () => Promise<void>;
    extractMeshes: (gltf: GLTF) => {
      rooms: THREE.Mesh[];
      inners: THREE.Mesh[];
    };
    computeInnerMeta: (inner: THREE.Mesh) => InnerMeta;
    computeRoomMeta: (room: THREE.Mesh) => RoomMeta;
    /**
     * Update child mesh 'navmesh' of supplied `room`,
     * taking any attached Inners into account.
     */
    updateRoomNavmesh: (room: THREE.Mesh) => void;
  };
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
  rooms: {},
  inners: {},
  loadedGltf: false,
  navWorker: null,
  api: {
    load: async () => {
      const { loadedGltf, api } = get();
      if (loadedGltf) {
        return;
      }
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader');

      (new GLTFLoader()).load('/rooms.gltf', (gltf) => {
        const { rooms, inners } = api.extractMeshes(gltf);
        const roomMetas = rooms.map(room => api.computeRoomMeta(room));
        const innerMetas = inners.map(room => api.computeInnerMeta(room));
        // roomMetas.forEach(meta => api.extendRoom(meta));
        
        // console.log({ rooms, inners, metas });
        set(_ => ({
          loadedGltf: true,
          rooms: lookupFromValues(roomMetas),
          inners: lookupFromValues(innerMetas),
        }));

      });

      const navWorker = new (await import('@nav/nav.worker')).default;
      useEnvStore.setState({ navWorker });
      navWorker.postMessage({ key: 'ping-navworker' });
    },

    extractMeshes: (gltf: GLTF) => {
      const rooms = [] as THREE.Mesh[];
      const inners = [] as THREE.Mesh[];
      gltf.scene.traverse((node) => {
        switch (node.name) {
          case 'rooms': {
            rooms.push(...node.children.filter(isMeshNode));
            rooms.forEach(room => {
              // Reset planar position
              room.position.setX(0);
              // Remove gltf rotation
              room.position.setY(0);
              room.geometry.rotateX(Math.PI/2);
              // Put on floor
              room.geometry.translate(0, 0, -room.geometry.boundingBox!.min.z);
            });
            node.updateMatrixWorld();
            break;
          }
          case 'inners': {
            inners.push(...node.children.filter(isMeshNode));
            inners.forEach(inner => {
              inner.position.setY(0);
              inner.geometry.rotateX(Math.PI/2);
              inner.geometry.translate(0, 0, -inner.geometry.boundingBox!.min.z);
            });
            break;
          }
        }
      });
      return { rooms, inners };
    },
    
    computeInnerMeta: (inner) => {
      const geometry = geomService.toThreeGeometry(inner.geometry as THREE.BufferGeometry);
      const basePoly = geomService.projectGeometryXY(inner, geometry);
      const unnavigable = basePoly.flatMap(x => geomService.outset(x, outsetAmount));

      return {
        key: inner.name,
        mesh: inner,
        unnavigable,
      };
    },

    computeRoomMeta: (room) => {
      // Compute room bounding rect in XY plane
      const floor = Geom.Rect.fromPoints(
        geomService.projectXY(room.geometry.boundingBox!.min),
        geomService.projectXY(room.geometry.boundingBox!.max),
      );

      // Compute base of walls as list of (multi)polygons
      const geometry = geomService.toThreeGeometry(room.geometry as THREE.BufferGeometry);
      const wallsPoly = geomService.projectGeometryXY(room, geometry);
      
      // Compute navmesh by cutting outset walls from rect
      const navigablePoly = geomService.cutOut(
        wallsPoly.flatMap(x => geomService.outset(x, outsetAmount)),
        [Geom.Polygon.fromRect(floor)],
      );

      const highMesh = room.clone();
      highMesh.geometry = highMesh.geometry.clone();
      highMesh.geometry.scale(1, 1, 3);

      return {
        key: room.name,
        mesh: room,
        highMesh,
        floor,
        walls: wallsPoly,
        navigable: navigablePoly,
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
        .filter(({ name, children }) => name === innerGroupName && children[0] && isMeshNode(children[0]))
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
      navMesh.name = navmeshGroupName;
      // Each item is a rectangular decomposition of a rectilinear multipolygon
      const navPartitions = navigable.map(part => geomService.computeRectPartition(part));
      navPartitions.forEach(rects => {
        /**
         * Possibly wasteful to create many PlaneGeometry instead of one Mesh.
         * We'll traverse these quads to find instantiated navmesh.
         */
        rects.forEach(({ cx, cy, width, height }) => {
          const plane = new THREE.Mesh(new THREE.PlaneGeometry(width, height, 1), navMeshMaterial);
          plane.name = navmeshPlaneName;
          plane.receiveShadow = true;
          plane.position.set(cx, cy, 0);
          navMesh.add(plane);
          // plane.add(new THREE.LineSegments(// Debug only
          //   new THREE.EdgesGeometry(plane.geometry),
          //   new THREE.LineBasicMaterial( { color: 0xffffff } ),
          // ));
        });
      });

      const prevNavmesh = roomGroup.children.find(({ name }) => name === navmeshGroupName);
      prevNavmesh && roomGroup.remove(prevNavmesh);
      roomGroup.add(navMesh);
      roomGroup.updateMatrixWorld();
    },

  },
}), 'geom'));

export default useStore;
