import { Subject } from 'rxjs';
import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import * as Geom from 'model/geom';
import { KeyedLookup } from 'model/generic.model';
import { geomService } from 'model/geom.service';
import * as Stage from 'model/stage/stage.model';
import { TransformKey } from 'model/stage/stage.proxy';
import { addToLookup, LookupUpdates, removeFromLookup, Updates, updateLookup } from './store.util';

export type State = {
  stage: KeyedLookup<Stage.StageMeta>;
  persist: KeyedLookup<Stage.PersistedStage>;

  readonly api: {
    addWalls: (
      stageKey: string,
      walls: WallDef[],
      opts: { polygonKey?: string; cutOut?: boolean },
    ) => void;
    applyBrush: (stageKey: string, opts: { erase?: boolean }) => void;
    createStage: (stageKey: string) => void;
    cutSelectPolysInBrush: (stageKey: string) => void;
    deselectPolysInBrush: (stageKey: string) => void;
    ensureStage: (stageKey: string) => void;
    getPolygon: (stageKey: string, polygonKey: string) => Stage.NamedPolygons;
    getStage: (stageKey: string) => Stage.StageMeta;
    modifyPolygon: (
      stageKey: string,
      polygonKey: string,
      delta: Geom.Polygon[],
      opts: { cutOut?: boolean },
    ) => void;
    rememberPolygon: (stageKey: string, polygonKey: string) => void;
    removeStage: (stageKey: string) => void;
    selectPolysInBrush: (stageKey: string) => void;
    transformBrush: (stageKey: string, transformKey: TransformKey) => void;
    /** Undo/redo last paint/erase */
    undoRedoPolygons: (stageKey: string) => void;
    updateBounds: (stageKey: string) => void;
    updateBrush: (stageKey: string, updates: Updates<Stage.BrushMeta>) => void;
    updateInternal: (stageKey: string, updates: Updates<Stage.StageMeta['internal']>) => void;
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
  persist: {},
  api: {

    addWalls: (stageKey, walls, { polygonKey = 'default', cutOut }) => {
      const delta = walls.map(([x, y, w, h]) =>
        Geom.Polygon.fromRect(new Geom.Rect(x, y, w, h)).precision(1));
      api.rememberPolygon(stageKey, polygonKey);
      api.modifyPolygon(stageKey, polygonKey, delta, { cutOut });
      api.updateBounds(stageKey);
    },

    applyBrush: (stageKey, opts) => {
      const { api } = get();
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
      api.updateBounds(stageKey);
    },

    createStage: (stageKey) => set(({ stage }) => ({
      stage: addToLookup({
        key: stageKey,
        internal: {
          camEnabled: true,
          keyEvents: new Subject,
          prevPolygon: {},
          // other stuff attached by components
        },

        brush: Stage.createDefaultBrushMeta(),
        polygon: {
          default: Stage.createNamedPolygons('default'),
          navigable: Stage.createNamedPolygons('navigable'),
        },
        walls: Stage.createStageWalls({
          polygonKeys: ['default'],
        }),
        
        bounds: new Geom.Rect(-1, -1, 2, 2),
      }, stage),
    })),

    cutSelectPolysInBrush: (stageKey) => {
      const { brush, walls, polygon } = get().api.getStage(stageKey)
      const selection = Stage.getBrushSelection(brush, walls, polygon);

      if (!selection.length) {
        return;
      } else if (!brush.locked) {
        brush.selectFrom.set(brush.position.x, brush.position.y, 0);
        get().api.updateBrush(stageKey, { locked: true, selection });
        get().api.applyBrush(stageKey, { erase: true });
      } else { // When selection exists just delete it
        get().api.applyBrush(stageKey, { erase: true });
      }

    },

    deselectPolysInBrush: (stageKey) => {
      get().api.updateBrush(stageKey, { locked: false, selection: [] });
    },

    ensureStage: (stageKey) => {
      if(!get().stage[stageKey]) {
        get().api.createStage(stageKey);
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

    rememberPolygon: (stageKey, polygonKey) => {
      const prev = get().api.getPolygon(stageKey, polygonKey);
      get().api.updateInternal(stageKey, ({ prevPolygon: prevPolygonLookup }) => ({
        prevPolygon: addToLookup(prev, prevPolygonLookup),
      }));
    },

    removeStage: (stageKey) => set(({ stage }) => ({
      stage: removeFromLookup(stageKey, stage),
    })),

    selectPolysInBrush: (stageKey) => {
      const { brush, walls, polygon } = get().api.getStage(stageKey)
      const selection = Stage.getBrushSelection(brush, walls, polygon);

      if (selection.length && !brush.locked) {
        brush.selectFrom.set(brush.position.x, brush.position.y, 0);
        get().api.updateBrush(stageKey, { locked: true, selection });
      }
    },

    transformBrush: (stageKey, key) => {
      const { selection } = get().api.getStage(stageKey).brush;
      const rect = Geom.Rect.union(selection.flatMap(x => x.polygons).map(x => x.rect));
      let mutator: (p: Geom.Vector) => void;
      const center = rect.center;
      switch (key) {
        case 'mirror(x)':
          mutator = (p) => p.x = (2 * center.x) - p.x; break;
        case 'mirror(y)':
          mutator = (p) => p.y = (2 * center.y) - p.y; break;
        case 'rotate(90)':
          mutator = (p) => p.set(center.x - (p.y - center.y), center.y + (p.x - center.x)); break;
        case 'rotate(-90)':
          mutator = (p) => p.set(center.x + (p.y - center.y), center.y - (p.x - center.x)); break;
        default:
          return;
      }
      selection.forEach(x => x.polygons.map(y => {
        y.mutatePoints(mutator).precision(1);
        (key === 'mirror(x)' || key === 'mirror(y)') && y.reverse();
      }));
      get().api.updateBrush(stageKey, { selection: selection.slice() });
    },

    undoRedoPolygons: (stageKey) => {
      const { polygon } = get().api.getStage(stageKey);
      const { prevPolygon } = get().api.getStage(stageKey).internal;
      get().api.updateInternal(stageKey, { prevPolygon: polygon })
      get().api.updateStage(stageKey, { polygon: prevPolygon })
    },

    updateBounds: (stageKey) => {
      const { walls, polygon } = get().api.getStage(stageKey);
      const polygons = walls.polygonKeys.flatMap(x => polygon[x].polygons);
      get().api.updateStage(stageKey, {
        bounds: Geom.Rect.union(polygons.map(x => x.rect)).outset(1),
      });
    },

    updateBrush: (stageKey, updates) => {
      get().api.updateStage(stageKey, ({ brush }) => ({
        brush: { ...brush,
          ...typeof updates === 'function' ? updates(brush) : updates,
        },
      }));
    },

    updateInternal: (stageKey, updates) => {
      get().api.updateStage(stageKey, ({ internal }) => ({
        internal: { ...internal,
          ...typeof updates === 'function' ? updates(internal) : updates,
        }
      }));
    },

    updatePolygon: (stageKey, polygonKey, updates) => {
      get().api.updateStage(stageKey, ({ polygon }) => ({
        polygon: updateLookup(
          polygonKey,
          polygon,
          typeof updates === 'function' ? updates : () => updates,
        ),
      }));
    },

    updateStage: (stageKey, updates) => {
      set(({ stage }) => ({
        stage: updateLookup(
          stageKey,
          stage,
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
  version: 2,
  blacklist: ['api', 'stage'],
}), 'stage'));

const api = useStore.getState().api;
const useStageStore = Object.assign(useStore, { api });

export default useStageStore;
