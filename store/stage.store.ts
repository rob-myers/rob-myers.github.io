import create from 'zustand';
import { devtools } from 'zustand/middleware';
import * as THREE from 'three';

import { deepClone, KeyedLookup } from 'model/generic.model';
import { getWindow } from 'model/dom.model';
import { vectorToTriple, loadJson, createPlaceholderGroup } from 'model/3d/three.model';
import * as Stage from 'model/stage/stage.model';
import { addToLookup, LookupUpdates, removeFromLookup, Updates, updateLookup } from './store.util';
import { Controls } from 'model/3d/controls';

export type State = {
  rehydrated: boolean;
  persistOnUnload: boolean;
  /** Resolved on stage create or if already exists */
  resolvers: { stageKey: string; resolve: () => void }[];
  /** Stages */
  stage: KeyedLookup<Stage.StageMeta>;

  readonly api: {
    awaitStage: (stageKey: string, resolver: () => void) => Promise<void>;
    getStage: (stageKey: string) => Stage.StageMeta;
    persist: (stageKey: string) => void;
    rehydrate: (stageKeys: string[]) => void;
    removeStage: (stageKey: string) => void;
    updateOpt: (stageKey: string, updates: Updates<Stage.StageOpts>) => void;
    updateStage: (stageKey: string, updates: LookupUpdates<Stage.StageMeta>) => void;
  }
}

const useStore = create<State>(devtools((set, get) => ({
  persistOnUnload: true,
  rehydrated: false,
  resolvers: [],
  stage: {},
  persist: {},

  api: {

    awaitStage: async (stageKey, resolve) => {
      const { stage, resolvers } = get();
      if (!stage[stageKey]) {
        resolvers.push({ stageKey, resolve });
      } else {
        resolve();
      }
    },

    getStage: (stageKey) => {
      return get().stage[stageKey];
    },

    persist: (stageKey) => {
      const { ctrl, opt, scene, extra } = api.getStage(stageKey);

      const stageJson: Stage.StageMetaJson = {
        key: stageKey,
        opt: deepClone(opt),
        extra: {
          canvasPreview: extra.canvasPreview,
          sceneJson: scene.toJSON(),
          cameraJson: ctrl?.camera.toJSON(),
          camTarget: vectorToTriple(ctrl.target),
        },
      };
      const serialized = JSON.stringify({ state: stageJson });

      localStorage.setItem(`${stageKey}@stage`, serialized);
      // set({});
    },

    rehydrate: (stageKeys) => {
      if (!getWindow()) return;

      for (const stageKey of stageKeys) {
        const storageValue = localStorage.getItem(`${stageKey}@stage`);
       
        if (storageValue) {
          const { state } = JSON.parse(storageValue) as { state: Stage.StageMetaJson };
          const { opt, extra } = state;

          const s = Stage.createStage(stageKey);
          s.opt = deepClone(opt??Stage.createStageOpts());

          Promise.all([
            loadJson<THREE.Scene>(extra.sceneJson),
            loadJson<THREE.PerspectiveCamera | THREE.OrthographicCamera>(extra.cameraJson),
          ]).then(([scene, camera]) => {
            // console.info('Loaded json scene & camera', scene, camera);
            s.extra.bgScene = scene;
            s.extra.sceneGroup = scene.children[1] as THREE.Group || createPlaceholderGroup();
            s.extra.sceneCamera = camera;
            s.extra.canvasPreview = extra.canvasPreview;
  
            s.ctrl = Stage.initializeControls(new Controls(camera));
            s.ctrl.target.set(...extra.camTarget);
  
            set(({ stage }) => ({ stage: addToLookup(s, stage) }));
          });

        } else {
          set(({ stage }) => ({ stage: addToLookup(Stage.createStage(stageKey), stage) }));
        }

        // Awaken anything waiting
        get().resolvers.filter(x => x.stageKey === stageKey).forEach(({ resolve }) => resolve());
        get().resolvers = get().resolvers.filter(x => x.stageKey !== stageKey);
      }

      set(() => ({ rehydrated: true }));
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
}), 'stage'));

const api = useStore.getState().api;
const useStageStore = Object.assign(useStore, { api });

export default useStageStore;
