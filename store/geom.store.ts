/**
 * We'll use this store to import gltfs and create navmeshes.
 */
import create from 'zustand';
import { devtools } from 'zustand/middleware'
import * as THREE from 'three';

import { geom, outsetBounds, outsetWalls } from 'model/geom.service';
import * as Geom from 'model/geom';
import { recastService } from 'model/3d/recast.service';
import { Bot, initStageBounds } from 'model/stage/stage.model';

import thinPlusPng from '../3d/img/thin-plus.png';

export type State = {
  loaded: boolean;
  loading: boolean;
  loadResolvers: (() => void)[];
  /** Animated bot loaded from gltf */
  bot: null | Bot;
  /** Texture library */
  texture: Record<string, THREE.Texture>;

  readonly api: {
    /** Create a navigation mesh using recast */
    createNavMesh: (navKey: string, polys: Geom.Polygon[]) => {
      bounds: Geom.Rect;
      navPolys: Geom.Polygon[];
    };
    /** Wait until we've loaded gltf(s) exported from Blender. */
    loadGltfs: () => Promise<void>;
    /** Load images as `THREE.Texture`s */
    loadTextures: () => void;
    /** Request a navpath from previously created navmesh */
    requestNavPath: (navKey: string, src: Geom.Vector, dst: Geom.Vector) => Geom.VectorJson[];
  };
}

export interface MeshDef {
  mesh: THREE.Mesh;
}

const useStore = create<State>(devtools((set, get) => ({
  loaded: false,
  loading: false,
  loadResolvers: [],
  bot: null,
  texture: {},

  api: {

    loadGltfs: async () => {
      if (get().loaded) {
        return;
      } else if (get().loading) {
        return new Promise(resolve => get().loadResolvers.push(resolve));
      }
      set(_ => ({ loading: true }));

      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader');
      const loader = new GLTFLoader;
      // const { DRACOLoader } = await import('three/examples/jsm/loaders/DRACOLoader');
      // Needs files public/draco/ e.g. draco-decoder.js
      // loader.setDRACOLoader((new DRACOLoader).setDecoderPath('/draco/'));

      const gltf = await loader.loadAsync('/bot.gltf');
      const group = gltf.scene.children[0] as THREE.Group;
      const clips = gltf.animations;
      // console.log({ gltf });

      set(_ => ({
        loaded: true,
        loading: false,
        bot: { name: 'original', group, clips },
      }));
      while (get().loadResolvers.pop()?.());
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

      const navPolys = geom.cutOut(
        polys.flatMap(x => geom.outset(x, outsetWalls)),
        [Geom.Polygon.from(bounds)],
      );
      // console.log({ bounds, navPolys });

      // Non-blocking creation of recast navmesh
      const geometry = geom.polysToGeometry(navPolys, 'xz');
      setTimeout(() => recastService.createNavMesh(navKey, geometry));
      return { bounds, navPolys };
    },

    requestNavPath: (navKey, src, dst) => {
      try {
        const src3 = new THREE.Vector3(src.x, src.y);
        const dst3 = new THREE.Vector3(dst.x, dst.y);
        const navPath = recastService.computePath(navKey, src3, dst3);
        return geom.removePathReps(
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
