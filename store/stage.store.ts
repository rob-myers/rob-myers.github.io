import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import * as Geom from 'model/geom';
import { deepClone, KeyedLookup, mapValues } from 'model/generic.model';
import { geomService } from 'model/geom.service';
import * as Stage from 'model/stage/stage.model';
import { TransformKey } from 'model/stage/stage.proxy';
import { vectorToTriple } from 'model/3d/three.model';
import { addToLookup, LookupUpdates, removeFromLookup, Updates, updateLookup } from './store.util';

import useGeom from './geom.store';

export type State = {
  stage: KeyedLookup<Stage.StageMeta>;
  rehydrated: boolean;
  persist: KeyedLookup<Stage.PersistedStage>;

  readonly api: {
    addWalls: (
      stageKey: string,
      walls: WallDef[],
      opts: { polygonKey: string; cutOut?: boolean },
    ) => void;
    applyBrush: (stageKey: string, opts: { erase?: boolean }) => void;
    createStage: (stageKey: string) => void;
    cutSelectPolysInBrush: (stageKey: string) => void;
    deselectPolysInBrush: (stageKey: string) => void;
    ensurePolygon: (stageKey: string, polygonKey: string) => void;
    ensureStage: (stageKey: string) => void;
    getPolygon: (stageKey: string, polygonKey: string) => Stage.NamedPolygons;
    getPersist: (stageKey: string) => Stage.PersistedStage;
    getStage: (stageKey: string) => Stage.StageMeta;
    modifyPolygon: (
      stageKey: string,
      polygonKey: string,
      delta: Geom.Polygon[],
      opts: { cutOut?: boolean; mutate?: boolean },
    ) => void;
    persist: (stageKey: string) => void;
    rememberPolygon: (stageKey: string, polygonKey: string, mutate?: boolean) => void;
    removeStage: (stageKey: string) => void;
    selectPolysInBrush: (stageKey: string) => void;
    spawnMesh: (stageKey: string, meshKey: string) => void;
    transformBrush: (stageKey: string, transformKey: TransformKey) => void;
    undoRedoPolygons: (stageKey: string) => void;
    updateBrush: (stageKey: string, updates: Updates<Stage.BrushMeta>) => void;
    updateExtra: (stageKey: string, updates: Updates<Stage.StageExtra>) => void;
    updateInternal: (stageKey: string, updates: Updates<Stage.StageInternal>) => void;
    updateNavigable: (stageKey: string) => void;
    updateOpts: (stageKey: string, updates: Updates<Stage.StageOpts>) => void;
    updatePolygon: (
      stageKey: string,
      polygonKey: string,
      updates: Partial<Stage.NamedPolygons>,
      mutate?: boolean,
    ) => void;
    updateStage: (stageKey: string, updates: LookupUpdates<Stage.StageMeta>) => void;
    updateWalls: (stageKey: string, updates: Updates<Stage.StageWalls>) => void;
  }
}

type WallDef = [number, number, number, number];

const useStore = create<State>(devtools(persist((set, get) => ({
  stage: {},
  rehydrated: false,
  persist: {},
  api: {

    addWalls: (stageKey, walls, { polygonKey, cutOut }) => {
      const delta = walls.map(([x, y, w, h]) =>
        Geom.Polygon.fromRect(new Geom.Rect(x, y, w, h)).precision(1));
      api.ensurePolygon(stageKey, polygonKey);
      api.rememberPolygon(stageKey, polygonKey);
      api.modifyPolygon(stageKey, polygonKey, delta, { cutOut });
      api.updateNavigable(stageKey);
      api.persist(stageKey);
    },

    applyBrush: (stageKey, opts) => {
      const brush = api.getStage(stageKey).brush;
      
      if (!brush.selection.length) {// Add/cut rectangle
        const delta = Stage.getGlobalBrushRect(brush).precision(1);
        api.rememberPolygon(stageKey, brush.rectToolPolygonKey, true);
        api.modifyPolygon(stageKey, brush.rectToolPolygonKey, [delta], {
          cutOut: opts.erase, mutate: true,
        });
      } else {// Add/cut offset selection
        const offset = brush.position.clone().sub(brush.selectFrom);
        for (const { polygonKey, polygons } of brush.selection) {
          const delta = polygons.map(x => x.clone().add(offset));
          api.rememberPolygon(stageKey, polygonKey, true);
          api.modifyPolygon(stageKey, polygonKey, delta, {
            cutOut: opts.erase, mutate: true,
          });
        }
      }
      api.updateNavigable(stageKey);
      api.persist(stageKey);
    },

    createStage: (stageKey) => {
      const instance: Stage.StageMeta = Stage.createStage(stageKey);

      // Get persisted data for rehydration
      const { polygon, opts, extra } = api.getPersist(stageKey) || (
        get().persist[stageKey] = Stage.createPersist(stageKey)
      );
      // Rehydrate
      instance.polygon = mapValues(polygon, (x) => ({
        key: x.key,
        polygons: x.polygons.map(y => Geom.Polygon.from(y)),
      }));
      instance.opts = deepClone(opts);
      instance.extra = deepClone(extra);

      set(({ stage }) => ({ stage: addToLookup(instance, stage) }));
    },

    cutSelectPolysInBrush: (stageKey) => {
      const { brush, walls, polygon } = api.getStage(stageKey)
      const selection = Stage.getBrushSelection(brush, walls, polygon);

      if (!selection.length) {
        return;
      } else if (!brush.locked) {
        brush.selectFrom.set(brush.position.x, brush.position.y, 0);
        api.updateBrush(stageKey, { locked: true, selection });
        api.applyBrush(stageKey, { erase: true });
      } else {// When selection exists just delete it
        api.applyBrush(stageKey, { erase: true });
      }
    },

    deselectPolysInBrush: (stageKey) => {
      api.updateBrush(stageKey, { locked: false, selection: [] });
    },

    ensurePolygon: (stageKey, polygonKey) => {
      const { polygon, internal: { prevPolygon } } = api.getStage(stageKey);
      polygon[polygonKey] = polygon[polygonKey] || Stage.createNamedPolygons(polygonKey);
      prevPolygon[polygonKey] = prevPolygon[polygonKey] || Stage.createNamedPolygons(polygonKey);
    },

    ensureStage: (stageKey) => {
      if(!get().stage[stageKey]) {
        api.createStage(stageKey);
      }
    },

    getPersist: (stageKey) => {
      return get().persist[stageKey];
    },

    getPolygon: (stageKey, polyonKey) => {
      return get().stage[stageKey].polygon[polyonKey];
    },

    getStage: (stageKey) => {
      return get().stage[stageKey];
    },

    modifyPolygon: (stageKey, polygonKey, delta, { cutOut, mutate }) => {
      try {
        const { polygons: prev } = api.getPolygon(stageKey, polygonKey);
        const next = cutOut
          ? geomService.cutOut(delta, prev)
          : geomService.union(prev.concat(delta));
        next.forEach(polygon => polygon.precision(1));
        api.updatePolygon(stageKey, polygonKey, { polygons: next }, mutate);
      } catch (error) {
        console.error('stage.store: modifyPolygon: geometric operation failed');
        console.error(error);
      }
    },

    persist: (stageKey) => {
      const { polygon, internal, opts, extra } = api.getStage(stageKey);

      const computedCameraPos = internal.controls?.camera?.position
        ? vectorToTriple(internal.controls.camera.position) : null;

      set(({ persist }) => ({ persist: addToLookup({
          key: stageKey,
          polygon: mapValues(polygon, (x) => ({
            key: x.key,
            polygons: x.polygons.map(x => x.json),
          })),
          opts: { ...deepClone(opts),
            initCameraPos: [...computedCameraPos ||
              persist[stageKey].opts.initCameraPos ||
              opts.initCameraPos],
          },
          extra: deepClone(extra),
        }, persist),
      }));
    },

    rememberPolygon: (stageKey, polygonKey, mutate = false) => {
      const prev = api.getPolygon(stageKey, polygonKey);
      if (mutate) {
        api.getStage(stageKey).internal.prevPolygon[prev.key] = prev;
      } else {
        api.updateInternal(stageKey, ({ prevPolygon }) => ({
          prevPolygon: addToLookup(prev, prevPolygon),
        }));
      }
    },

    removeStage: (stageKey) => set(({ stage }) => ({
      stage: removeFromLookup(stageKey, stage),
    })),

    selectPolysInBrush: (stageKey) => {
      const { brush, walls, polygon } = api.getStage(stageKey)
      const selection = Stage.getBrushSelection(brush, walls, polygon);

      if (selection.length && !brush.locked) {
        brush.selectFrom.set(brush.position.x, brush.position.y, 0);
        api.updateBrush(stageKey, { locked: true, selection });
      }
    },

    spawnMesh: (stageKey, meshKey) => {
      const meshInstance = useGeom.api.cloneMesh(meshKey);
      const { brush } = api.getStage(stageKey);
      meshInstance.position.set(brush.position.x, brush.position.y, 0);
      const instanceKey = meshInstance.uuid; // TODO ?
      api.updateStage(stageKey, ({ mesh }) => ({ mesh: { ...mesh,
          [instanceKey]: { key: instanceKey, meshKey, mesh: meshInstance },
        }}),
      );
    },

    transformBrush: (stageKey, key) => {
      const { brush } = api.getStage(stageKey);
      const { rect } = Stage.getGlobalBrushRect(brush);
      // Adjust offset (TODO explain)
      rect.x -= (brush.position.x - brush.selectFrom.x);
      rect.y -= (brush.position.y - brush.selectFrom.y);
      // Ensure center is pairwise a multiple of 0.1
      (rect.width * 10) % 2 && (rect.width += 0.1);
      (rect.height * 10) % 2 && (rect.height += 0.1);
      const center = rect.center;

      let mutator: (p: Geom.Vector) => void;
      switch (key) {
        case 'mirror(x)':
          mutator = (p) => p.y = (2 * center.y) - p.y; break;
        case 'mirror(y)':
          mutator = (p) => p.x = (2 * center.x) - p.x; break;
        case 'rotate(90)':
          mutator = (p) => p.set(center.x - (p.y - center.y), center.y + (p.x - center.x)); break;
        case 'rotate(-90)':
          mutator = (p) => p.set(center.x + (p.y - center.y), center.y - (p.x - center.x)); break;
        default:
          return;
      }

      const { selection } = api.getStage(stageKey).brush;
      selection.forEach(x => x.polygons.map(y => {
        y.mutatePoints(mutator).precision(1);
        (key === 'mirror(x)' || key === 'mirror(y)') && y.reverse();
      }));
      api.updateBrush(stageKey, { selection: selection.slice() });
    },

    undoRedoPolygons: (stageKey) => {
      const stage = api.getStage(stageKey);
      const { polygon, internal, internal: { prevPolygon } } = stage;
      internal.prevPolygon = polygon;
      stage.polygon = prevPolygon;
      api.updateNavigable(stageKey);
      api.persist(stageKey);
    },

    updateBrush: (stageKey, updates) => {
      api.updateStage(stageKey, ({ brush }) => ({
        brush: { ...brush,
          ...typeof updates === 'function' ? updates(brush) : updates,
        },
      }));
    },

    updateExtra: (stageKey, updates) => {
      api.updateStage(stageKey, ({ extra }) => ({
        extra: { ...extra,
          ...typeof updates === 'function' ? updates(extra) : updates,
        },
      }));
    },

    updateInternal: (stageKey, updates) => {
      api.updateStage(stageKey, ({ internal }) => ({
        internal: { ...internal,
          ...typeof updates === 'function' ? updates(internal) : updates,
        },
      }));
    },

    updateNavigable: (stageKey) => {
      const { walls, polygon, internal } = api.getStage(stageKey);
      const wallPolys = walls.polygonKeys.flatMap(x => polygon[x].polygons);
      const { bounds, navPolys } = useGeom.api.createNavMesh(stageKey, wallPolys);

      internal.bounds = bounds;
      polygon[Stage.CorePolygonKey.navigable].polygons = navPolys;
      polygon[Stage.CorePolygonKey.walls].polygons = wallPolys;
      api.updateStage(stageKey, ({ internal, polygon }) => ({
        internal: { ...internal }, polygon: { ...polygon }
      }));
    },

    updateOpts: (stageKey, updates) => {
      api.updateStage(stageKey, ({ opts }) => ({
        opts: { ...opts,
          ...typeof updates === 'function' ? updates(opts) : updates,
        },
      }));
    },

    updatePolygon: (stageKey, polygonKey, updates, mutate) => {
      if (mutate)  {
        const { polygon } = api.getStage(stageKey);
        Object.assign(polygon[polygonKey], updates);
      } else {
        api.updateStage(stageKey, ({ polygon }) => ({
          polygon: updateLookup(polygonKey, polygon, () => updates),
        }));
      }
    },

    updateStage: (stageKey, updates) => {
      set(({ stage }) => ({
        stage: updateLookup(stageKey, stage,
          typeof updates === 'function' ? updates : () => updates,
        ),
      }));
    },

    updateWalls: (stageKey, updates) => {
      get().api.updateStage(stageKey, ({ walls }) => ({
        walls: { ...walls,
          ...typeof updates === 'function' ? updates(walls) : updates,
        },
      }));
    },

  },
}), {
  name: 'stage',
  version: 0,
  blacklist: ['api', 'stage'],
  onRehydrateStorage: (_) =>  {
    return () => {
      useStageStore.setState({ rehydrated: true });
    };
  },
}), 'stage'));

const api = useStore.getState().api;
const useStageStore = Object.assign(useStore, { api });

export default useStageStore;
