import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import * as THREE from 'three';

import { deepClone, KeyedLookup } from 'model/generic.model';
import { vectorToTriple, loadJson, getPlaceholderGroup, createThreeGroup } from 'model/3d/three.model';
import * as Stage from 'model/stage/stage.model';
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

        s.extra.initCamPos = extra.initCamPos || Stage.initCameraPos;
        s.extra.initCamTarget = extra.initCamTarget || Stage.initCameraPos;
        s.extra.initCamZoom = extra.initCamZoom || Stage.initCameraZoom;
        s.extra.canvasPreview = extra.canvasPreview;
        s.extra.sceneJson = extra.sceneJson;
        
        if (extra.sceneJson) {// Restore scene
          loadJson<THREE.Scene>(extra.sceneJson).then((scene) => {
            // console.warn('Loaded json scene', scene);
            s.extra.bgScene = scene;
            s.extra.group = scene.children[1] as THREE.Group || getPlaceholderGroup();
            set(({ stage }) => ({ stage: addToLookup(s, stage) }));
          });
        } else {
          s.extra.bgScene.add(createThreeGroup("Helpers"));
          s.extra.group = getPlaceholderGroup();
          set(({ stage }) => ({ stage: addToLookup(s, stage) }));
        }

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

      // TODO persist camera?
      const currCamTarget = ctrl?.target ? vectorToTriple(ctrl.target) : null;
      const currCamPos = ctrl?.camera?.position ? vectorToTriple(ctrl.camera.position) : null;
      const currCamZoom = ctrl?.camera?.zoom;

      set(({ persist, persist: { [stageKey]: prev } }) => ({ persist: addToLookup({
        key: stageKey,
        opt: deepClone(opt),
          extra: {
            canvasPreview: extra.canvasPreview,
            initCamPos: [...currCamPos || prev.extra.initCamPos || extra.initCamPos],
            initCamTarget: [...currCamTarget || prev.extra.initCamTarget || extra.initCamTarget],
            initCamZoom: (currCamZoom??(prev.extra.initCamZoom || extra.initCamZoom)),

            sceneJson: scene.toJSON(),
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
