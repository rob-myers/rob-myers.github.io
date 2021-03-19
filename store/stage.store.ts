import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import * as Geom from 'model/geom';
import { deepClone, KeyedLookup } from 'model/generic.model';
import { addToLookup, ReduxUpdater, removeFromLookup, updateLookup } from './store.util';
import { geomService } from 'model/geom.service';
import { defaultSelectRectMeta, PersistedStage, StoredStage } from 'model/stage.model';
import { Subject } from 'rxjs';

export type State = {
  stage: KeyedLookup<StoredStage>;
  persist: KeyedLookup<PersistedStage>;

  readonly api: {
    addWalls: (stageKey: string, walls: WallDef[], opts: {
      cutOut?: boolean;
    }) => void;
    createStage: (stageKey: string) => void;
    // getData: (stageKey: string, path: string) => any;
    getStage: (stageKey: string) => StoredStage;
    removeStage: (stageKey: string) => void;
    // setData: (stageKey: string, path: string, data: any) => void;
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
        brush: deepClone(defaultSelectRectMeta),
        keyEvents: new Subject,
        selectPolys: [],
        wallPolys: [],
      }, stage),
    })),
    getStage: (stageKey) => {
      return get().stage[stageKey];
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
