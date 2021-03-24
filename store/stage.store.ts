import { Subject } from 'rxjs';
import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import * as Geom from 'model/geom';
import { KeyedLookup } from 'model/generic.model';
import { addToLookup, CustomUpdater, removeFromLookup, updateLookup } from './store.util';
import { geomService } from 'model/geom.service';
import { BrushMeta, computeGlobalBrushRect, createDefaultBrushMeta, createStageLayer, PersistedStage, StageLayer, StageMeta } from 'model/stage/stage.model';

export type State = {
  stage: KeyedLookup<StageMeta>;
  persist: KeyedLookup<PersistedStage>;

  readonly api: {
    addWalls: (stageKey: string, walls: WallDef[], opts: { cutOut?: boolean }) => void;
    applyBrush: (stageKey: string, opts: { layer?: string; erase?: boolean }) => void;
    createStage: (stageKey: string) => void;
    getBrush: (stageKey: string) => BrushMeta;
    getLayer: (stageKey: string, layerKey: string) => StageLayer;
    getStage: (stageKey: string) => StageMeta;
    removeStage: (stageKey: string) => void;
    updateBrush: (stageKey: string, updates: Partial<BrushMeta>) => void;
    updateLayer: (
      stageKey: string,
      layerKey: string,
      updates: CustomUpdater<StageLayer>,
    ) => void;
    updateStage: (stageKey: string, updates: CustomUpdater<StageMeta>) => void;
  }
}

type WallDef = [number, number, number, number];

const useStore = create<State>(devtools(persist((set, get) => ({
  stage: {},
  persist: {},
  api: {

    addWalls: (stageKey, walls, { cutOut }) => {
      const layerKey = 'default';
      const { polygons: prev } = api.getLayer(stageKey, layerKey);
      const delta = walls.map(([x, y, w, h]) =>
        Geom.Polygon.fromRect(new Geom.Rect(x, y, w, h)));
      const wallPolys = cutOut
        ? geomService.cutOut(delta, prev)
        : geomService.union(prev.concat(delta));
      api.updateLayer(stageKey, layerKey, { polygons: wallPolys });
    },

    applyBrush: (stageKey, opts) => {
      const brush = get().api.getBrush(stageKey);
      const delta = Geom.Polygon.fromRect(computeGlobalBrushRect(brush));
      
      const layerKey = 'default';
      const { polygons: prev } = api.getLayer(stageKey, layerKey);
      try {
        const layerPolys = opts.erase
          ? geomService.cutOut([delta], prev)
          : geomService.union(prev.concat(delta));
        api.updateLayer(stageKey, layerKey, { polygons: layerPolys });
      } catch (error) {
        console.error('Geometric operation failed');
        console.error(error);
      }
    },

    createStage: (stageKey) => set(({ stage }) => ({
      stage: addToLookup({
        key: stageKey,
        camEnabled: true,
        brush: createDefaultBrushMeta(),
        keyEvents: new Subject,
        layer: addToLookup(createStageLayer('default'), {}),
      }, stage),
    })),

    getBrush: (stageKey) => {
      return get().stage[stageKey].brush;
    },

    getLayer: (stageKey, layerKey) => {
      return get().stage[stageKey].layer[layerKey];
    },

    getStage: (stageKey) => {
      return get().stage[stageKey];
    },

    removeStage: (stageKey) => set(({ stage }) => ({
      stage: removeFromLookup(stageKey, stage),
    })),

    updateBrush: (stageKey, updates) => {
      get().api.updateStage(stageKey, ({ brush }) => ({
        brush: { ...brush, ...updates },
      }));
    },

    updateLayer: (stageKey, layerKey, updates) => {
      get().api.updateStage(stageKey, ({ layer }) => ({
        layer: updateLookup(
          layerKey,
          layer,
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

  },
}), {
  name: 'stage',
  version: 2,
  blacklist: ['api', 'stage'],
}), 'stage'));

const api = useStore.getState().api;
const useStageStore = Object.assign(useStore, { api });

export default useStageStore;
