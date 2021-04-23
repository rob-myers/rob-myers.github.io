import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { deepClone, KeyedLookup } from 'model/generic.model';
import * as Geom from 'model/geom';
import * as Stage from 'model/stage/stage.model';
import { identityMatrix4, vectorToTriple } from 'model/3d/three.model';
import { addToLookup, LookupUpdates, removeFromLookup, Updates, updateLookup } from './store.util';

export type State = {
  stage: KeyedLookup<Stage.StageMeta>;
  rehydrated: boolean;
  persist: KeyedLookup<Stage.PersistedStage>;
  // TODO stage events instead
  resolve: {
    createStage: { [stageKey: string]: (() => void)[] };
  };

  readonly api: {
    awaitStage: (stageKey: string, resolver: () => void) => Promise<void>;
    ensureStage: (stageKey: string) => void;
    getPersist: (stageKey: string) => Stage.PersistedStage;
    getStage: (stageKey: string) => Stage.StageMeta;
    persist: (stageKey: string) => void;
    removeStage: (stageKey: string) => void;
    updateExtra: (stageKey: string, updates: Updates<Stage.StageExtra>) => void;
    updateInternal: (stageKey: string, updates: Updates<Stage.StageInternal>) => void;
    updateOpts: (stageKey: string, updates: Updates<Stage.StageOpts>) => void;
    updateSelection: (stageKey: string, updates: Updates<Stage.StageSelection>) => void;
    updateStage: (stageKey: string, updates: LookupUpdates<Stage.StageMeta>) => void;
  }
}

const useStore = create<State>(devtools(persist((set, get) => ({
  stage: {},
  rehydrated: false,
  persist: {},
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
        const instance = Stage.createStage(stageKey);
        const { opts, extra, selection  } = api.getPersist(stageKey);
        instance.opts = deepClone(opts??Stage.createStageOpts());
        instance.extra = deepClone(extra??{ initCameraPos: Stage.initCameraPos, initCursorPos: Stage.initCursorPos });
        instance.selection.polygons = (selection.polygons??[]).map(x => Geom.Polygon.from(x));
        instance.selection.prevPolys = instance.selection.polygons.slice();
        instance.selection.enabled = selection.enabled??true;
        instance.selection.additive = selection.additive??false;
        instance.selection.locked = selection.locked??false;
        instance.selection.group.matrix.fromArray(selection.matrix);

        set(({ stage }) => ({ stage: addToLookup(instance, stage) }));
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
      const { internal, opts, extra, selection } = api.getStage(stageKey);

      const currentCameraPos = internal.controls?.camera?.position
        ? vectorToTriple(internal.controls.camera.position) : null;
      const currentCursorPos = extra.cursorGroup?.position
        ? vectorToTriple(extra.cursorGroup?.position) : null;

      set(({ persist }) => ({ persist: addToLookup({
          key: stageKey,
          opts: deepClone(opts),
          extra: {
            canvasPreview: extra.canvasPreview,
            initCameraPos: [...currentCameraPos ||
              persist[stageKey].extra.initCameraPos || extra.initCameraPos
            ],
            initCursorPos: [...currentCursorPos ||
              persist[stageKey].extra.initCursorPos || extra.initCursorPos
            ],
          },
          selection: {
            polygons: selection.polygons.map(x => x.json),
            locked: selection.locked,
            enabled: selection.enabled,
            additive: selection.additive,
            matrix: (selection.group?.matrix??identityMatrix4).toArray(),
          },
        }, persist),
      }));
    },

    removeStage: (stageKey) => set(({ stage }) => ({
      stage: removeFromLookup(stageKey, stage),
    })),

    updateExtra: (stageKey, updates) => {
      api.updateStage(stageKey, ({ extra }) => ({
        extra: { ...extra,
          ...typeof updates === 'function' ? updates(extra) : updates,
        },
      }));
    },

    updateInternal: (stageKey, updates) => {
      api.updateStage(stageKey, ({ internal }) => ({
        internal: { ...internal,
          ...typeof updates === 'function' ? updates(internal) : updates,
        },
      }));
    },

    updateOpts: (stageKey, updates) => {
      api.updateStage(stageKey, ({ opts }) => ({
        opts: { ...opts,
          ...typeof updates === 'function' ? updates(opts) : updates,
        },
      }));
    },

    updateSelection: (stageKey, updates) => {
      api.updateStage(stageKey, ({ selection }) => ({
        selection: { ...selection,
          ...typeof updates === 'function' ? updates(selection) : updates,
        },
      }));
    },

    updateStage: (stageKey, updates) => {
      set(({ stage }) => ({
        stage: updateLookup(stageKey, stage,
          typeof updates === 'function' ? updates : () => updates,
        ),
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
