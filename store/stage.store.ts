import create from 'zustand';
import { devtools } from 'zustand/middleware';
import * as THREE from 'three';

import { deepClone, KeyedLookup } from 'model/generic.model';
import { vectorToTriple, loadJson } from 'model/3d/three.model';
import * as Stage from 'model/stage/stage.model';
import { addToLookup, LookupUpdates, Updates, updateLookup } from './store.util';
import { Controls } from 'model/3d/controls';

export type State = {
  rehydrated: boolean;
  stage: KeyedLookup<Stage.StageMeta>;
  view: KeyedLookup<Stage.StageView>;

  readonly api: {
    getStage: (stageKey: string) => Stage.StageMeta;
    getView: (viewKey: string) => Stage.StageView;
    persistStage: (stageKey: string, force?: boolean) => void;
    persistView: (viewKey: string, force?: boolean) => void;
    rehydrate: (viewIds: {stageKey: string; viewKey: string }[]) => void;
    updateOpt: (viewKey: string, updates: Updates<Stage.StageViewOpts>) => void;
    updateStage: (stageKey: string, updates: LookupUpdates<Stage.StageMeta>) => void;
    updateView: (viewKey: string, updates: LookupUpdates<Stage.StageView>) => void;
  }
}

const useStore = create<State>(devtools((set, get) => ({
  rehydrated: false,
  stage: {},
  view: {},

  api: {

    getStage: (stageKey) => {
      return get().stage[stageKey];
    },
    getView: (viewKey) => {
      return get().view[viewKey];
    },

    persistStage: (stageKey, force = false) => {
      const { scene } = api.getStage(stageKey);

      const stageJson: Stage.StageMetaJson = {
        key: stageKey,
        extra: {
          sceneJson: scene.toJSON(),
        },
      };
      localStorage.setItem(`stage:${stageKey}`, JSON.stringify(stageJson));
    },

    persistView: (viewKey, force = false) => {
      const { stageKey, ctrl, canvasPreview, opt } = api.getView(viewKey);

      if (!opt.persist && !force) return;

      const viewJson: Stage.StageViewJson = {
        key: viewKey,
        stageKey,
        camTarget: vectorToTriple(ctrl.target),
        cameraJson: ctrl?.camera.toJSON(),
        canvasPreview,
        opt: deepClone(opt),
      };
      localStorage.setItem(`view:${viewKey}`, JSON.stringify(viewJson));
    },

    rehydrate: async (viewIds) => {
      // Rehydrate views
      for (const { stageKey, viewKey } of viewIds) {
        const viewString = localStorage.getItem(`view:${viewKey}`);

        if (!viewString) {
          set(({ view }) => ({ view: addToLookup(Stage.createView(stageKey, viewKey), view) }));
          continue;
        }

        try {
          const {
            stageKey,
            cameraJson,
            canvasPreview,
            camTarget,
            opt,
          } = JSON.parse(viewString) as Stage.StageViewJson;
          const v = Stage.createView(stageKey, viewKey);

          const camera = await loadJson<THREE.PerspectiveCamera | THREE.OrthographicCamera>(cameraJson);
          // console.info('Loaded json scene & camera', scene, camera);
          v.camera = camera;
          v.canvasPreview = canvasPreview;
          v.ctrl = Stage.initializeControls(new Controls(camera));
          v.ctrl.target.set(...camTarget);
          v.opt = deepClone(opt??Stage.createStageViewOpts());
          v.opt.enabled = false; // Force initially disabled

          set(({ view }) => ({ view: addToLookup(v, view) }));

        } catch (e) {
          console.error(`Failed to rehydrate view ${viewKey}`);
          console.error(e);
          set(({ view }) => ({ view: addToLookup(Stage.createView(stageKey, viewKey), view) }));
        }
      }

      // Rehydrate stages
      const stageKeys = Array.from(new Set(viewIds.map(x => x.stageKey)));
      for (const stageKey of stageKeys) {
        const stageString = localStorage.getItem(`stage:${stageKey}`);

        if (!stageString) {
          set(({ stage }) => ({ stage: addToLookup(Stage.createStage(stageKey), stage) }));
          continue;
        }

        try {
          const { extra } = JSON.parse(stageString) as Stage.StageMetaJson;
          const s = Stage.createStage(stageKey);
          // console.log({ stageKey, opt, extra });

          const scene = await loadJson<THREE.Scene>(extra.sceneJson);
          s.scene = scene;
          set(({ stage }) => ({ stage: addToLookup(s, stage) }));
          console.info('Loaded json scene', s);

        } catch (e) {
          console.error(`Failed to rehydrate stage ${stageKey}`);
          console.error(e);
          set(({ stage }) => ({ stage: addToLookup(Stage.createStage(stageKey), stage) }));
        }
      }

      set(() => ({ rehydrated: true }));
    },

    updateOpt: (viewKey, updates) => {
      api.updateView(viewKey, ({ opt: opts }) => ({
        opt: { ...opts, ...typeof updates === 'function' ? updates(opts) : updates },
      }));
    },

    updateStage: (stageKey, updates) => {
      set(({ stage }) => ({
        stage: updateLookup(stageKey, stage, typeof updates === 'function' ? updates : () => updates),
      }));
    },
    updateView: (viewKey, updates) => {
      set(({ view }) => ({
        view: updateLookup(viewKey, view, typeof updates === 'function' ? updates : () => updates),
      }));
    },

  },
}), 'stage'));

const api = useStore.getState().api;
const useStageStore = Object.assign(useStore, { api });

export default useStageStore;
