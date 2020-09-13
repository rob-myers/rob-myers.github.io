import create from 'zustand';
import { devtools } from 'zustand/middleware'
import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

import { KeyedLookup, lookupFromValues } from '@model/generic.model';
import { isMeshNode, outsetAmount } from '@model/three/three.model';
import * as Geom from '@model/geom/geom.model'
import GeomService from '@model/geom/geom.service';
import { innerGroupName, navmeshGroupName, navMeshMaterial } from '@model/env/env.model';

export interface State {
  loadedGltf: boolean;
  rooms: KeyedLookup<RoomMeta>;
  inners: KeyedLookup<InnerMeta>;
  api: {
    geom: GeomService;
    load: () => Promise<void>;
    extractMeshes: (gltf: GLTF) => {
      rooms: THREE.Mesh[];
      inners: THREE.Mesh[];
    };
    computeInnerMeta: (inner: THREE.Mesh) => InnerMeta;
    computeRoomMeta: (room: THREE.Mesh) => RoomMeta;
    /** Takes Inners attached to parent into account */
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
  api: {
    geom: new GeomService,

    load: async () => {
      const { loadedGltf: loadedRooms, api } = get();
      if (loadedRooms) {
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
      const { geom } = get().api;
      const geometry = geom.toThreeGeometry(inner.geometry as THREE.BufferGeometry);
      const basePoly = geom.projectGeometryXY(inner, geometry);
      const unnavigable = basePoly.flatMap(x => geom.outset(x, outsetAmount));

      return {
        key: inner.name,
        mesh: inner,
        unnavigable,
      };
    },

    computeRoomMeta: (room) => {
      const { geom } = get().api;
      // Compute room bounding rect in XY plane
      const floor = Geom.Rect.fromPoints(
        geom.projectXY(room.geometry.boundingBox!.min),
        geom.projectXY(room.geometry.boundingBox!.max),
      );

      // Compute base of walls as list of (multi)polygons
      const geometry = geom.toThreeGeometry(room.geometry as THREE.BufferGeometry);
      const wallsPoly = geom.projectGeometryXY(room, geometry);
      
      // Compute navmesh by cutting outset walls from rect
      const navigablePoly = geom.cutOut(
        wallsPoly.flatMap(x => geom.outset(x, outsetAmount)),
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

    updateRoomNavmesh: (room: THREE.Mesh) => {
      const { api: { geom }, inners } = get();
      const { [room.name]: meta } = get().rooms;
      const roomGroup = room.parent!;

      const roomInners = roomGroup.children
        .filter(({ name, children }) => name === innerGroupName && isMeshNode(children[0]))
        .map(({ children }) => inners[children[0].name]);
      // console.log('Computing and attaching navmesh...', room, roomInners);

      const navigable = geom.cutOut(
        roomInners.flatMap(({ unnavigable }) => unnavigable.map(p => p.clone())),
        meta.navigable.map(p => p.clone()),
      );
      
      // Each element is a rectangular decomposition of a rectilinear multipolygon
      const navPartitions = navigable.map(part => geom.computeRectPartition(part));
      const navMesh = new THREE.Group();
      navMesh.name = navmeshGroupName;

      navPartitions.forEach(rects => {
        // TODO create a single mesh
        rects.forEach(({ cx, cy, width, height }) => {
          const plane = new THREE.Mesh(new THREE.PlaneGeometry(width, height, 2), navMeshMaterial);
          plane.position.set(cx, cy, 0);
          navMesh.add(plane);
        });
      });
      
      const previous = roomGroup.children.find(({ name }) => name === navmeshGroupName);
      previous && roomGroup.remove(previous);
      roomGroup.add(navMesh);
    },

  },
}), 'geom'));

export default useStore;
