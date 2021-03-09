import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Scene } from 'three';
import { KeyedLookup } from 'model/generic.model';
import { PanZoomControls } from 'model/3d/controls';
import { addToLookup, removeFromLookup, updateLookup } from './store.util';

export type State = {
  stage: KeyedLookup<StoredStage>;
  persist: KeyedLookup<PersistedStage>;

  readonly api: {
    createStage: (stageKey: string) => void;
    getStage: (stageKey: string) => StoredStage;
    removeStage: (stageKey: string) => void;
    updateStage: (stageKey: string, updates: Partial<StoredStage>) => void;
  }
}

export type StoredStage = {
  key: string;
  scene?: Scene;
  controls?: PanZoomControls;
};

interface PersistedStage {
  key: string;
  // TODO
}

const useStore = create<State>(devtools(persist((set, get) => ({
  stage: {},
  persist: {},
  api: {
    createStage: (stageKey) => set(({ stage }) => ({
      stage: addToLookup({
        key: stageKey,
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
