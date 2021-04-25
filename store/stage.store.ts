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
    updatePoly: (stageKey: string, updates: Updates<Stage.StagePoly>) => void;
    updateSel: (stageKey: string, updates: Updates<Stage.StageSelection>) => void;
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
        const s = Stage.createStage(stageKey);
        const { opts, extra, sel, poly } = api.getPersist(stageKey);
        s.opts = deepClone(opts??Stage.createStageOpts());
        s.extra = deepClone(extra??{ initCameraPos: Stage.initCameraPos, initCursorPos: Stage.initCursorPos });
        s.internal.cursorGroup.position.set(...s.extra.initCursorPos);
        s.sel.localPolys = (sel.polygons??[]).map(x => Geom.Polygon.from(x));
        s.sel.prevPolys = s.sel.localPolys.slice();
        s.sel.enabled = sel.enabled??true;
        s.sel.additive = sel.additive??false;
        s.sel.locked = sel.locked??false;
        s.sel.group.matrix.fromArray(sel.matrix);
        s.poly.wall = (poly.wall??[]).map(x => Geom.Polygon.from(x));
        s.poly.obs = (poly.obs??[]).map(x => Geom.Polygon.from(x));

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
      const { internal, opts, extra, sel, poly } = api.getStage(stageKey);

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
          sel: {
            polygons: sel.localPolys.map(x => x.json),
            locked: sel.locked,
            enabled: sel.enabled,
            additive: sel.additive,
            matrix: (sel.group?.matrix??identityMatrix4).toArray(),
          },
          poly: {
            wall: poly.wall.map(x => x.json),
            obs: poly.obs.map(x => x.json),
          },
        }, persist),
      }));
    },

    removeStage: (stageKey) => set(({ stage }) => ({
      stage: removeFromLookup(stageKey, stage),
    })),

    updateExtra: (stageKey, updates) => {
      api.updateStage(stageKey, ({ extra }) => ({
        extra: { ...extra, ...typeof updates === 'function' ? updates(extra) : updates },
      }));
    },
    updateInternal: (stageKey, updates) => {
      api.updateStage(stageKey, ({ internal }) => ({
        internal: { ...internal, ...typeof updates === 'function' ? updates(internal) : updates },
      }));
    },
    updateOpts: (stageKey, updates) => {
      api.updateStage(stageKey, ({ opts }) => ({
        opts: { ...opts, ...typeof updates === 'function' ? updates(opts) : updates },
      }));
    },
    updatePoly: (stageKey, updates) => {
      api.updateStage(stageKey, ({ poly }) => ({
        poly: { ...poly, ...typeof updates === 'function' ? updates(poly) : updates },
      }));
    },
    updateSel: (stageKey, updates) => {
      api.updateStage(stageKey, ({ sel: selection }) => ({
        sel: { ...selection, ...typeof updates === 'function' ? updates(selection) : updates },
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
