import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Scene } from 'three';
import { Subject } from 'rxjs';

import * as Geom from 'model/geom';
import { KeyedLookup } from 'model/generic.model';
import { PanZoomControls } from 'model/3d/pan-zoom-controls';
import { addToLookup, removeFromLookup, updateLookup } from './store.util';
import { geomService } from 'model/geom.service';
import { StageMsg } from 'model/stage.model';

export type State = {
  stage: KeyedLookup<StoredStage>;
  persist: KeyedLookup<PersistedStage>;

  readonly api: {
    addWalls: (stageKey: string, walls: WallDef[], opts: {
      cutOut?: boolean;
    }) => void;
    createStage: (stageKey: string) => void;
    getStage: (stageKey: string) => StoredStage;
    removeStage: (stageKey: string) => void;
    updateStage: (stageKey: string, updates: Partial<StoredStage>) => void;
  }
}

type WallDef = [number, number, number, number];

export type StoredStage = {
  key: string;
  camEnabled: boolean;
  /** Send messages to stage here */
  input: Subject<StageMsg>;
  /** Attached on mount */
  controls?: PanZoomControls;
  /** Currently selected polygon */
  selectPolys: Geom.Polygon[];
  /** Attached on mount */
  scene?: Scene;
  /** Base of walls. */
  wallPolys: Geom.Polygon[];
};

interface PersistedStage {
  key: string;
  // TODO
}

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
        input: new Subject,
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
        stage: updateLookup(stageKey, stage, () => updates),
      }));
    },
  },
}), {
  name: 'stage',
  version: 1,
  blacklist: ['api', 'stage'],
}), 'stage'));

const api = useStore.getState().api;
const useStageStore = Object.assign(useStore, { api });

export default useStageStore;
