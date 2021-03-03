import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { KeyedLookup } from 'model/generic.model';
import { addToLookup, removeFromLookup } from './store.util';

export type State = {
  stage: KeyedLookup<Stage>;

  readonly api: {
    createStage: (stageKey: string) => void;
    removeStage: (stageKey: string) => void;
  }
}

export type Stage = {
  key: string;
  // TODO
};

const useStore = create<State>(devtools(persist((set, _get) => ({
  stage: {},
  api: {
    createStage: (stageKey) => set(({ stage }) => ({
      stage: addToLookup({
        key: stageKey,
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
const useChartStore = Object.assign(useStore, { api });

export default useChartStore;
