import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import * as Geom from 'model/geom';
import { deepClone, deepGet, kebabToCamel, KeyedLookup } from 'model/generic.model';
import { addToLookup, ReduxUpdater, removeFromLookup, updateLookup } from './store.util';
import { geomService } from 'model/geom.service';
import { defaultSelectRectMeta, PersistedStage, StoredStage } from 'model/stage.model';

export type State = {
  stage: KeyedLookup<StoredStage>;
  persist: KeyedLookup<PersistedStage>;

  readonly api: {
    addWalls: (stageKey: string, walls: WallDef[], opts: {
      cutOut?: boolean;
    }) => void;
    createStage: (stageKey: string) => void;
    getData: (stageKey: string, path: string) => any;
    getStage: (stageKey: string) => StoredStage;
    removeStage: (stageKey: string) => void;
    setData: (stageKey: string, path: string, data: any) => void;
    updateStage: (
      stageKey: string,
      updates: Partial<StoredStage> | ReduxUpdater<StoredStage>,
    ) => void;
  }
}

type WallDef = [number, number, number, number];

const useStore = create<State>(devtools(persist((set, get) => ({
  stage: {},
  persist: {},
  api: {
    addWalls: (stageKey, walls, { cutOut }) => {
      const { wallPolys: prev } = api.getStage(stageKey);
      const delta = walls.map(([x, y, w, h]) =>
        Geom.Polygon.fromRect(new Geom.Rect(x, y, w, h)));
      const wallPolys = cutOut
        ? geomService.cutOut(delta, prev)
        : geomService.union(prev.concat(delta));
      api.updateStage(stageKey, { wallPolys });
    },
    createStage: (stageKey) => set(({ stage }) => ({
      stage: addToLookup({
        key: stageKey,
        camEnabled: true,
        selector: deepClone(defaultSelectRectMeta),
        selectPolys: [],
        wallPolys: [],
      }, stage),
    })),
    getData: (stageKey, pathStr) => {
      const stage = get().stage[stageKey];
      const path = pathStr.split('/').map(kebabToCamel).filter(Boolean);
      return deepGet(stage, path);
    },
    getStage: (stageKey) => {
      return get().stage[stageKey];
    },
    setData: (stageKey, pathStr, data) => {
      const stage = get().stage[stageKey];
      const path = pathStr.split('/').map(kebabToCamel).filter(Boolean);
      if (path.length) {
        const last = path.pop()!;
        deepGet(stage, path)[last] = data;
        api.updateStage(stageKey, {});
      }
    },
    removeStage: (stageKey) => set(({ stage }) => ({
      stage: removeFromLookup(stageKey, stage),
    })),
    updateStage: (stageKey, updates) => {
      set(({ stage }) => ({
        stage: updateLookup(stageKey, stage,
          typeof updates === 'function' ? updates : () => updates),
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
