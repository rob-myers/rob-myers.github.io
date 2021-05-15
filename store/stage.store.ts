import { Subject } from 'rxjs';
import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { deepClone, KeyedLookup } from 'model/generic.model';
import * as Stage from 'model/stage/stage.model';
import { vectorToTriple } from 'model/3d/three.model';
import { addToLookup, LookupUpdates, removeFromLookup, Updates, updateLookup } from './store.util';

export type State = {
  stage: KeyedLookup<Stage.StageMeta>;
  rehydrated: boolean;
  persistOnUnload: boolean;
  persist: KeyedLookup<Stage.StageMetaJson>;
  // TODO stage events instead
  resolve: {
    createStage: { [stageKey: string]: (() => void)[] };
  };

  readonly api: {
    awaitStage: (stageKey: string, resolver: () => void) => Promise<void>;
    /** Get or rehydrate stage */
    ensureStage: (stageKey: string) => void;
    getPersist: (stageKey: string) => Stage.StageMetaJson;
    getStage: (stageKey: string) => Stage.StageMeta;
    persist: (stageKey: string) => void;
    removeStage: (stageKey: string) => void;
    updateOpt: (stageKey: string, updates: Updates<Stage.StageOpts>) => void;
    updateStage: (stageKey: string, updates: LookupUpdates<Stage.StageMeta>) => void;
  }
}

const useStore = create<State>(devtools(persist((set, get) => ({
  stage: {},
  persist: {},
  persistOnUnload: true,
  rehydrated: false,
  resolve: { createStage: {} },

  api: {

    awaitStage: async (stageKey, resolver) => {
      const { stage, resolve: { createStage } } = get();
      if (!stage[stageKey]) {
        (createStage[stageKey] = createStage[stageKey] || []).push(resolver);
      } else {
        resolver();
      }
    },

    ensureStage: (stageKey) => {
      if (get().stage[stageKey]) {
        return;
      }
      
      if (get().persist[stageKey]) {
        // Restore persisted data
        const s = Stage.createStage(stageKey);
        const { opt, extra } = api.getPersist(stageKey);
        s.opt = deepClone(opt??Stage.createStageOpts());
        s.extra = {
          ...deepClone(extra??{ initCamPos: Stage.initCameraPos, initCamZoom: Stage.initCameraZoom }),
          keyEvent: new Subject,
          ptrEvent: new Subject,
        };
        
        set(({ stage }) => ({ stage: addToLookup(s, stage) }));
      } else {
        set(({ stage, persist }) => ({
          stage: addToLookup(Stage.createStage(stageKey), stage),
          persist: addToLookup(Stage.createPersist(stageKey), persist),
        }));
      }

      while(get().resolve.createStage[stageKey]?.pop?.());
    },

    getPersist: (stageKey) => {
      return get().persist[stageKey];
    },

    getStage: (stageKey) => {
      return get().stage[stageKey];
    },

    persist: (stageKey) => {
      const { ctrl, opt: opts, extra } = api.getStage(stageKey);

      const currCamPos = ctrl?.camera?.position ? vectorToTriple(ctrl.camera.position) : null;
      const currCamTarget = ctrl?.target ? vectorToTriple(ctrl.target) : null;
      const currCamZoom = ctrl?.camera?.zoom;
    
      set(({ persist }) => ({ persist: addToLookup({
          key: stageKey,
          opt: deepClone(opts),
          extra: {
            canvasPreview: extra.canvasPreview,
            initCamPos: [...currCamPos || persist[stageKey].extra.initCamPos || extra.initCamPos],
            initCamTarget: [...currCamTarget || persist[stageKey].extra.initCamTarget || extra.initCamTarget],
            initCamZoom: (currCamZoom??(persist[stageKey].extra.initCamZoom || extra.initCamZoom)),
          },
        }, persist),
      }));
    },

    removeStage: (stageKey) => set(({ stage }) => ({
      stage: removeFromLookup(stageKey, stage),
    })),

    updateOpt: (stageKey, updates) => {
      api.updateStage(stageKey, ({ opt: opts }) => ({
        opt: { ...opts, ...typeof updates === 'function' ? updates(opts) : updates },
      }));
    },
    updateStage: (stageKey, updates) => {
      set(({ stage }) => ({
        stage: updateLookup(stageKey, stage, typeof updates === 'function' ? updates : () => updates),
      }));
    },

  },
}), {
  name: 'stage',
  version: 1,
  blacklist: ['api', 'stage', 'resolve'],
  onRehydrateStorage: (_) =>  {
    return () => {
      useStageStore.setState({ rehydrated: true });
    };
  },
}), 'stage'));

const api = useStore.getState().api;
const useStageStore = Object.assign(useStore, { api });

export default useStageStore;
