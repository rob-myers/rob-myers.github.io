import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { KeyedLookup } from 'model/generic.model';
import { addToLookup, removeFromLookup, updateLookup } from './store.util';
import { Vector2 } from 'model/geom/vec2.model';

export type State = {
  stage: KeyedLookup<Stage>;
  persist: KeyedLookup<PersistedStage>;

  readonly api: {
    createStage: (stageKey: string) => void;
    getStage: (stageKey: string) => Stage;
    removeStage: (stageKey: string) => void;
    updateStage: (stageKey: string, updates: Partial<Stage>) => void;
  }
}

export type Stage = {
  key: string;
  zoomFactor: number;
  offset: Vector2;
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
        zoomFactor: 1,
        offset: Vector2.zero,
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
