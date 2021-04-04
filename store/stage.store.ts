import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import * as Geom from 'model/geom';
import { deepClone, KeyedLookup, mapValues } from 'model/generic.model';
import { geomService } from 'model/geom.service';
import * as Stage from 'model/stage/stage.model';
import { TransformKey } from 'model/stage/stage.proxy';
import { vectorToTriple } from 'model/3d/three.model';
import { addToLookup, LookupUpdates, removeFromLookup, Updates, updateLookup } from './store.util';

import useGeomStore from './geom.store';

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
    getStage: (stageKey: string) => Stage.StageMeta;
    modifyPolygon: (
      stageKey: string,
      polygonKey: string,
      delta: Geom.Polygon[],
      opts: { cutOut?: boolean },
    ) => void;
    persist: (stageKey: string) => void;
    rememberPolygon: (stageKey: string, polygonKey: string) => void;
    removeStage: (stageKey: string) => void;
    selectPolysInBrush: (stageKey: string) => void;
    transformBrush: (stageKey: string, transformKey: TransformKey) => void;
    undoRedoPolygons: (stageKey: string) => void;
    updateBrush: (stageKey: string, updates: Updates<Stage.BrushMeta>) => void;
    updateInternal: (stageKey: string, updates: Updates<Stage.StageMeta['internal']>) => void;
    updateNavigable: (stageKey: string) => void;
    updateOpts: (stageKey: string, updates: Updates<Stage.StageMeta['opts']>) => void;
    updatePolygon: (
      stageKey: string,
      polygonKey: string,
      updates: LookupUpdates<Stage.NamedPolygons>,
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
        const delta = Stage.getGlobalBrushRect(brush);
        api.rememberPolygon(stageKey, brush.rectToolPolygonKey);
        api.modifyPolygon(stageKey, brush.rectToolPolygonKey, [delta], { cutOut: opts.erase });
      } else {// Add/cut offset selection
        const offset = brush.position.clone().sub(brush.selectFrom);
        for (const { polygonKey, polygons } of brush.selection) {
          const delta = polygons.map(x => x.clone().add(offset));
          api.rememberPolygon(stageKey, polygonKey);
          api.modifyPolygon(stageKey, polygonKey, delta, { cutOut: opts.erase });
        }
      }
      api.updateNavigable(stageKey);
      api.persist(stageKey);
    },

    createStage: (stageKey) => {
      const instance: Stage.StageMeta = Stage.createStage(stageKey);

      // Get persisted data for rehydration
      const { polygon, cameraPosition, opts } = get().persist[stageKey] || (
        get().persist[stageKey] = Stage.createPersist(stageKey));
      // Rehydrate
      instance.internal.initCamPos.set(...cameraPosition);
      instance.polygon = mapValues(polygon, (x) => ({
        key: x.key,
        polygons: x.polygons.map(y => Geom.Polygon.from(y)),
      }));
      instance.opts = deepClone(opts);

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

    getPolygon: (stageKey, polyonKey) => {
      return get().stage[stageKey].polygon[polyonKey];
    },

    getStage: (stageKey) => {
      return get().stage[stageKey];
    },

    modifyPolygon: (stageKey, polygonKey, delta, { cutOut }) => {
      try {
        const { polygons: prev } = api.getPolygon(stageKey, polygonKey);
        const next = cutOut
          ? geomService.cutOut(delta, prev)
          : geomService.union(prev.concat(delta));
        api.updatePolygon(stageKey, polygonKey, { polygons: next });
      } catch (error) {
        console.error('stage.store: modifyPolygon: geometric operation failed');
        console.error(error);
      }
    },

    persist: (stageKey) => {
      const { polygon, internal, opts } = api.getStage(stageKey);
      set(({ persist }) => ({ persist: addToLookup({
          key: stageKey,
          polygon: mapValues(polygon, (x) => ({
            key: x.key,
            polygons: x.polygons.map(x => x.json),
          })),
          cameraPosition: vectorToTriple(
            internal.controls?.camera.position??Stage.initCameraPos),
          opts: deepClone(opts),
        }, persist),
      }));
    },

    rememberPolygon: (stageKey, polygonKey) => {
      const prev = api.getPolygon(stageKey, polygonKey);
      api.updateInternal(stageKey, ({ prevPolygon }) => ({
        prevPolygon: addToLookup(prev, prevPolygon),
      }));
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
      const { polygon, internal: { prevPolygon } } = api.getStage(stageKey);
      api.updateInternal(stageKey, { prevPolygon: polygon });
      api.updateStage(stageKey, { polygon: prevPolygon });
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

    updateInternal: (stageKey, updates) => {
      api.updateStage(stageKey, ({ internal }) => ({
        internal: { ...internal,
          ...typeof updates === 'function' ? updates(internal) : updates,
        },
      }));
    },

    updateNavigable: (stageKey) => {
      const { walls, polygon } = api.getStage(stageKey);
      const wallPolys = walls.polygonKeys.flatMap(x => polygon[x].polygons);
      const { bounds, navPolys } = useGeomStore.api.createNavMesh(stageKey, wallPolys);

      api.updateStage(stageKey, { bounds });
      api.updatePolygon(stageKey, Stage.CorePolygonKey.navigable, { polygons: navPolys });
      api.updatePolygon(stageKey, Stage.CorePolygonKey.walls, { polygons: wallPolys });
    },

    updateOpts: (stageKey, updates) => {
      api.updateStage(stageKey, ({ opts }) => ({
        opts: { ...opts,
          ...typeof updates === 'function' ? updates(opts) : updates,
        },
      }));
    },

    updatePolygon: (stageKey, polygonKey, updates) => {
      api.updateStage(stageKey, ({ polygon }) => ({
        polygon: updateLookup(polygonKey, polygon,
          typeof updates === 'function' ? updates : () => updates,
        ),
      }));
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
  version: 1,
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
