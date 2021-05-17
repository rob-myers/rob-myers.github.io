import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import * as THREE from 'three';

import { deepClone, KeyedLookup } from 'model/generic.model';
import { vectorToTriple, loadJson, getPlaceholderGroup } from 'model/3d/three.model';
import * as Stage from 'model/stage/stage.model';
import { addToLookup, LookupUpdates, removeFromLookup, Updates, updateLookup } from './store.util';
import { Controls } from 'model/3d/controls';

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
        s.extra.canvasPreview = extra.canvasPreview;

        Promise.all([
          loadJson<THREE.Scene>(extra.sceneJson),
          loadJson<THREE.PerspectiveCamera | THREE.OrthographicCamera>(extra.cameraJson),
        ]).then(([scene, camera]) => {
          // console.warn('Loaded json scene & camera', scene, camera);
          s.extra.bgScene = scene;
          s.extra.sceneGroup = scene.children[1] as THREE.Group || getPlaceholderGroup();
          s.extra.sceneCamera = camera;

          s.ctrl = Stage.initializeControls(new Controls(camera));
          s.ctrl.target.set(...extra.camTarget);

          set(({ stage }) => ({ stage: addToLookup(s, stage) }));
        });

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
      const { ctrl, opt, extra, scene } = api.getStage(stageKey);

      set(({ persist }) => ({ persist: addToLookup({
        key: stageKey,
        opt: deepClone(opt),
          extra: {
            canvasPreview: extra.canvasPreview,
            sceneJson: scene.toJSON(),
            cameraJson: ctrl?.camera.toJSON(),
            camTarget: vectorToTriple(ctrl.target),
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
  version: 0,
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
