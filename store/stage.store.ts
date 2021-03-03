import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { KeyedLookup } from 'model/generic.model';
import { addToLookup, removeFromLookup } from './store.util';
import { Vector2 } from 'model/geom/vec2.model';

export type State = {
  stage: KeyedLookup<Stage>;

  readonly api: {
    createStage: (stageKey: string) => void;
    removeStage: (stageKey: string) => void;
  }
}

export type Stage = {
  key: string;
  zoomFactor: number;
  offset: Vector2;
};

const useStore = create<State>(devtools(persist((set, _get) => ({
  stage: {},
  api: {
    createStage: (stageKey) => set(({ stage }) => ({
      stage: addToLookup({
        key: stageKey,
        zoomFactor: 1,
        offset: Vector2.zero,
      }, stage),
    })),
    removeStage: (stageKey) => set(({ stage }) => ({
      stage: removeFromLookup(stageKey, stage),
    })),
  },
}), {
  name: 'stage',
  version: 1,
  blacklist: ['api'],
}), 'stage'));

const api = useStore.getState().api;
const useStageStore = Object.assign(useStore, { api });

export default useStageStore;
