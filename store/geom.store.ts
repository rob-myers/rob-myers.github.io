import create from 'zustand';
import { devtools } from 'zustand/middleware'
import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

import { KeyedLookup } from '@model/generic.model';
import { isMeshNode, epsilon } from '@model/three/three.model';
import * as Geom from '@model/geom/geom.model'
import GeomService from '@model/geom/geom.service';

export interface State {
  loadedRooms: boolean;
  rooms: KeyedLookup<RoomMeta>;
  api: {
    geom: GeomService;
    loadRooms: () => Promise<void>;
    extractRooms: (gltf: GLTF) => THREE.Mesh[];
    computeRoomMeta: (room: THREE.Mesh) => RoomMeta;
    extendRoom: (meta: RoomMeta) => void;
  };
}

interface RoomMeta {
  /** Mesh name */
  key: string;
  mesh: THREE.Mesh;
  floor: Geom.Rect;
  walls: Geom.Polygon[];
  navigable: Geom.Polygon[];
}

const useStore = create<State>(devtools((set, get) => ({
  rooms: {},
  loadedRooms: false,
  api: {
    geom: new GeomService,
    loadRooms: async () => {
      if (get().loadedRooms) {
        return;
      }
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader');
      new GLTFLoader().load('/rooms.gltf', (gltf) => {
        const { api } = get();
        const rooms = api.extractRooms(gltf);
        const metas = rooms.map(room => api.computeRoomMeta(room));
        metas.forEach(meta => api.extendRoom(meta));
        // console.log({ rooms, metas });
        
        set(_ => ({
          loadedRooms: true,
          rooms: metas.reduce((agg, meta) => ({ ...agg, [meta.key]: meta }), {}),
        }));
      });
    },
    extractRooms: (gltf: GLTF) => {
      const rooms = [] as THREE.Mesh[];
      gltf.scene.traverse((node) => {
        if (node.name === 'rooms') {
          rooms.push(...node.children.filter(isMeshNode));
          rooms.forEach(room => {
            room.position.setX(0); // Reset planar position
          });
          node.updateMatrixWorld();
        }
      });
      return rooms;
    },
    computeRoomMeta: (room) => {
      const { geom } = get().api;
      const geometry = (new THREE.Geometry()).fromBufferGeometry(
        room.geometry as THREE.BufferGeometry,
      );
      const vs = geometry.vertices.map(p => room.localToWorld(p.clone()));
      
      const floor = Geom.Rect.fromPoints(
        geom.project(room.geometry.boundingBox!.min),
        geom.project(room.geometry.boundingBox!.max),
      );

      const wallTris = [] as Geom.Polygon[];
      geometry.faces.forEach(({ a, b, c }) => {
        const tri = [a, b, c].map(i => vs[i]);
        if (tri.every(p => Math.abs(p.y) < epsilon)) {
          wallTris.push(new Geom.Polygon(tri.map(geom.project)));
        }
      });
      // console.log({ key: room.name, floor, wallTris })
      const wallsPoly = geom.union(wallTris);

      const outsetAmount = 0.4;
      const navigablePoly = geom.cutOut(
        wallsPoly.flatMap(x => geom.outset(x, outsetAmount)),
        [Geom.Polygon.fromRect(floor)],
      );

      return {
        key: room.name,
        mesh: room,
        floor,
        walls: wallsPoly,
        navigable: navigablePoly,
      };
    },
    extendRoom: (meta) => {
      const { geom } = get().api;
      const floorZ = meta.mesh.geometry.boundingBox!.min.y;
      const material = new THREE.MeshBasicMaterial({
        color: 0x777777,
        opacity: 0.2,
        transparent: true,
        side: THREE.DoubleSide,
      });
      const navPartitions = meta.navigable.map(part => geom.computeRectPartition(part));
      // console.log(meta.key, navPartitions);

      navPartitions.forEach(rects => {
        rects.forEach(({ cx, cy, width, height }) => {
          const plane = new THREE.Mesh(new THREE.PlaneGeometry(width, height, 2), material);
          plane.position.set(cx, floorZ, -cy);
          plane.rotation.set(-Math.PI/2, 0, 0);
          meta.mesh.add(plane);
        });
      });
    },
  },
}), 'geom'));

export default useStore;
