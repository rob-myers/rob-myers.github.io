import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import * as Geom from 'model/geom';
import { deepClone, KeyedLookup, lookupFromValues, mapValues } from 'model/generic.model';
import { geomService } from 'model/geom.service';
import * as Stage from 'model/stage/stage.model';
import { TransformKey } from 'model/stage/stage.proxy';
import { vectorToTriple } from 'model/3d/three.model';
import { addToLookup, LookupUpdates, removeFromLookup, Updates, updateLookup } from './store.util';
import useGeom from './geom.store';

export type State = {
  stage: KeyedLookup<Stage.StageMeta>;
  rehydrated: boolean;
  persist: KeyedLookup<Stage.PersistedStage>;
  resolve: {
    createStage: { [stageKey: string]: (() => void)[] };
  };

  readonly api: {
    awaitStage: (stageKey: string, resolver: () => void) => Promise<void>;
    applyBrush: (stageKey: string, opts: { erase: boolean }) => void;
    applyBrushMeshes: (stageKey: string, opts: { erase: boolean }) => void;
    addWalls: (
      stageKey: string,
      walls: WallDef[],
      opts: { polygonKey: string; cutOut?: boolean },
    ) => void;
    cutWithBrush: (stageKey: string) => void;
    deselectBrush: (stageKey: string) => void;
    ensurePolygon: (stageKey: string, polygonKey: string) => void;
    ensureStage: (stageKey: string) => void;
    getPolygon: (stageKey: string, polygonKey: string) => Stage.NamedPolygons;
    getPersist: (stageKey: string) => Stage.PersistedStage;
    getStage: (stageKey: string) => Stage.StageMeta;
    modifyPolygon: (
      stageKey: string,
      polygonKey: string,
      delta: Geom.Polygon[],
      opts: { cutOut?: boolean; mutate?: boolean },
    ) => void;
    persist: (stageKey: string) => void;
    rememberPolygon: (stageKey: string, polygonKey: string, mutate?: boolean) => void;
    removeStage: (stageKey: string) => void;
    selectWithBrush: (stageKey: string) => void;
    spawnMesh: (stageKey: string, meshName: string) => void;
    transformBrush: (stageKey: string, transformKey: TransformKey) => void;
    undoRedoPolygons: (stageKey: string) => void;
    updateBrush: (stageKey: string, updates: Updates<Stage.BrushMeta>) => void;
    updateExtra: (stageKey: string, updates: Updates<Stage.StageExtra>) => void;
    updateInternal: (stageKey: string, updates: Updates<Stage.StageInternal>) => void;
    updateNavigable: (stageKey: string) => void;
    updateOpts: (stageKey: string, updates: Updates<Stage.StageOpts>) => void;
    updatePolygon: (
      stageKey: string,
      polygonKey: string,
      updates: Partial<Stage.NamedPolygons>,
      mutate?: boolean,
    ) => void;
    updateStage: (stageKey: string, updates: LookupUpdates<Stage.StageMeta>) => void;
    updateWalls: (stageKey: string, updates: Updates<Stage.StageWalls>) => void;
  }
}

type WallDef = [number, number, number, number];

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

    applyBrush: (stageKey, opts) => {
      const { brush } = api.getStage(stageKey);

      if (!brush.selectedPolys.length && !brush.selectedMeshes.length) {
        // Add/cut a rectangle
        const delta = Stage.getGlobalBrushRect(brush).precision(1);
        api.rememberPolygon(stageKey, brush.rectPolygonKey, true);
        api.modifyPolygon(stageKey, brush.rectPolygonKey, [delta], {
          cutOut: opts.erase, mutate: true,
        });
      } else {// Add/cut selected polygons and selected meshes
        const offset = brush.position.clone().sub(brush.selectFrom);
        for (const { polygonKey, polygons } of brush.selectedPolys) {
          const delta = polygons.map(x => x.clone().add(offset));
          api.rememberPolygon(stageKey, polygonKey, true);
          api.modifyPolygon(stageKey, polygonKey, delta, {
            cutOut: opts.erase, mutate: true,
          });
        }
      }
      api.applyBrushMeshes(stageKey, { erase: opts.erase });
      api.updateNavigable(stageKey);
      api.persist(stageKey);
    },

    applyBrushMeshes: (stageKey, { erase }) => {
      const { brush, mesh: prevLookup } = api.getStage(stageKey);
      const lookup = { ...prevLookup };
      if (erase) {
        const { rect: brushRect } = Stage.getGlobalBrushRect(brush);
        brushRect.outset(0.01);
        for (const { key, rect } of Object.values(lookup)) {
          brushRect.containsRect(rect) && delete lookup[key];
        }
      } else {
        const offset = brush.position.clone().sub(brush.selectFrom);
        for (const mesh of brush.selectedMeshes) {
          const { x, y } = mesh.position;
          const instance = Stage.createMeshInstance(mesh, { x: x + offset.x, y: y + offset.y });
          instance.mesh.material = useGeom.api.getMeshDef(mesh.name).mesh.material;
          lookup[instance.key] = instance;
        }
      } // mutate because will api.updateNavigable after
      api.getStage(stageKey).mesh = lookup;
    },

    addWalls: (stageKey, walls, { polygonKey, cutOut }) => {
      const delta = walls.map(([x, y, w, h]) =>
        Geom.Polygon.fromRect(new Geom.Rect(x, y, w, h)).precision(1));
      api.ensurePolygon(stageKey, polygonKey);
      api.rememberPolygon(stageKey, polygonKey, true);
      api.modifyPolygon(stageKey, polygonKey, delta, { cutOut, mutate: true });
      api.updateNavigable(stageKey);
      api.persist(stageKey);
    },

    cutWithBrush: (stageKey) => {
      const { brush, walls, polygon, mesh } = api.getStage(stageKey)
      const selectedPolys = Stage.computeSelectedPolygons(brush, walls, polygon);
      const selectedMeshes = Stage.computeSelectedMeshes(brush, mesh);

      if (!selectedPolys.length && !selectedMeshes.length) {
        return;
      } else if (!brush.locked) {
        brush.selectFrom.set(brush.position.x, brush.position.y, 0);
        // Need to update brush (vs mutate) because applyBrush won't update it
        api.updateBrush(stageKey, { locked: true, selectedPolys, selectedMeshes });
        api.applyBrush(stageKey, { erase: true });
      } else {// When selection exists, cut it out
        api.applyBrush(stageKey, { erase: true });
      }
    },

    deselectBrush: (stageKey) => {
      api.updateBrush(stageKey, { locked: false, selectedPolys: [], selectedMeshes: [] });
    },

    ensurePolygon: (stageKey, polygonKey) => {
      const { polygon, internal: { prevPolygon } } = api.getStage(stageKey);
      polygon[polygonKey] = polygon[polygonKey] || Stage.createNamedPolygons(polygonKey);
      prevPolygon[polygonKey] = prevPolygon[polygonKey] || Stage.createNamedPolygons(polygonKey);
    },

    ensureStage: (stageKey) => {
      if (get().stage[stageKey]) {
        return;
      }
      
      if (get().persist[stageKey]) {
        const instance = Stage.createStage(stageKey);
        const { polygon, mesh, opts, extra } = api.getPersist(stageKey);

        // Restore persisted data
        instance.polygon = mapValues(polygon, (x) => ({
          key: x.key,
          polygons: x.polygons.map(y => Geom.Polygon.from(y)),
        }));
        instance.opts = deepClone(opts);
        instance.extra = deepClone(extra);
        set(({ stage }) => ({ stage: addToLookup(instance, stage) }));

        // Persist meshes, but only when they're loaded
        useGeom.api.load().then((() => {
          set(({ stage }) => ({
            stage: updateLookup(instance.key, stage, () => ({
              mesh: lookupFromValues(
                Object.values(mesh).map<Stage.MeshInstance>(({ meshName, position: { x, y }, radians }) => {
                  const mesh = useGeom.api.cloneMesh(meshName);
                  mesh.position.set(x, y, 0);
                  mesh.rotation.set(0, 0, radians);
                  const rect = geomService.rectFromMesh(mesh);
                  return { key: mesh.uuid, mesh, rect };
                }),
              ),
            }),
          )}));
        }));
      } else {
        set(({ stage, persist }) => ({
          stage: addToLookup(Stage.createStage(stageKey), stage),
          persist: addToLookup(Stage.createPersist(stageKey), persist),
        }));
      }

      get().resolve.createStage[stageKey]?.forEach(resolve => resolve());
    },

    getPersist: (stageKey) => {
      return get().persist[stageKey];
    },

    getPolygon: (stageKey, polyonKey) => {
      return get().stage[stageKey].polygon[polyonKey];
    },

    getStage: (stageKey) => {
      return get().stage[stageKey];
    },

    modifyPolygon: (stageKey, polygonKey, delta, { cutOut, mutate }) => {
      try {
        const { polygons: prev } = api.getPolygon(stageKey, polygonKey);
        const next = cutOut
          ? geomService.cutOut(delta, prev)
          : geomService.union(prev.concat(delta));
        next.forEach(polygon => polygon.precision(1));
        api.updatePolygon(stageKey, polygonKey, { polygons: next }, mutate);
      } catch (error) {
        console.error('stage.store: modifyPolygon: geometric operation failed');
        console.error(error);
      }
    },

    persist: (stageKey) => {
      const { polygon, mesh, internal, opts, extra } = api.getStage(stageKey);

      const computedCameraPos = internal.controls?.camera?.position
        ? vectorToTriple(internal.controls.camera.position) : null;

      set(({ persist }) => ({ persist: addToLookup({
          key: stageKey,
          polygon: mapValues(polygon, (x) => ({
            key: x.key,
            polygons: x.polygons.map(x => x.json),
          })),
          mesh: mapValues<Stage.MeshInstance, Stage.MeshInstanceJson>(mesh, ({ key, mesh }) => ({
            key,
            meshName: mesh.name,
            position: { x: mesh.position.x, y: mesh.position.y },
            radians: mesh.rotation.z,
          })),
          opts: { ...deepClone(opts),
            initCameraPos: [...computedCameraPos ||
              persist[stageKey].opts.initCameraPos ||
              opts.initCameraPos],
          },
          extra: deepClone(extra),
        }, persist),
      }));
    },

    rememberPolygon: (stageKey, polygonKey, mutate = false) => {
      const prev = api.getPolygon(stageKey, polygonKey);
      const cloned: Stage.NamedPolygons = { ...prev, polygons: prev.polygons.map(x => x.clone()) };
      if (mutate) {
        api.getStage(stageKey).internal.prevPolygon[prev.key] = cloned;
      } else {
        api.updateInternal(stageKey, ({ prevPolygon }) => ({
          prevPolygon: addToLookup(prev, prevPolygon),
        }));
      }
    },

    removeStage: (stageKey) => set(({ stage }) => ({
      stage: removeFromLookup(stageKey, stage),
    })),

    selectWithBrush: (stageKey) => {
      const { brush, walls, polygon, mesh } = api.getStage(stageKey)
      const selectedPolys = Stage.computeSelectedPolygons(brush, walls, polygon);
      const selectedMeshes = Stage.computeSelectedMeshes(brush, mesh);

      if (!brush.locked && (selectedPolys.length || selectedMeshes.length)) {
        brush.selectFrom.set(brush.position.x, brush.position.y, 0);
        api.updateBrush(stageKey, { locked: true, selectedPolys, selectedMeshes });
      }
    },

    spawnMesh: (stageKey, meshName) => {
      const meshDef = useGeom.api.getMeshDef(meshName);
      const { brush } = api.getStage(stageKey);
      const instance = Stage.createMeshInstance(meshDef.mesh, brush.position);
      api.updateStage(stageKey, ({ mesh }) => ({ mesh: { ...mesh,
          [instance.key]: instance,
        }}),
      );
      api.updateNavigable(stageKey);
    },

    transformBrush: (stageKey, key) => {
      const { brush } = api.getStage(stageKey);
      const { rect } = Stage.getGlobalBrushRect(brush);
      // Adjust offset
      rect.x = brush.selectFrom.x;
      rect.y = brush.selectFrom.y - rect.height;
      // Ensure center coords are multiples of 0.1
      (rect.width * 10) % 2 && (rect.width += 0.1);
      (rect.height * 10) % 2 && (rect.height += 0.1);
      
      let mutator: (p: Geom.Vector) => void;
      const center = rect.center;
      switch (key) {
        case 'mirror(x)':
          mutator = (p) => p.y = (2 * center.y) - p.y; break;
        case 'mirror(y)':
          mutator = (p) => p.x = (2 * center.x) - p.x; break;
        case 'rotate(90)':
          mutator = (p) => p.set(center.x - (p.y - center.y), center.y + (p.x - center.x)); break;
        case 'rotate(-90)':
          mutator = (p) => p.set(center.x + (p.y - center.y), center.y - (p.x - center.x)); break;
        default:
          return;
      }

      brush.selectedPolys.forEach(x => x.polygons.map(y => {
        y.mutatePoints(mutator);
        (key === 'mirror(x)' || key === 'mirror(y)') && y.reverse();
      }));

      const p = new Geom.Vector;
      brush.selectedMeshes.forEach(mesh => {
        mutator(p.copy(mesh.position));
        mesh.position.set(p.x, p.y, 0);
        /**
         * TODO reflect and rotate meshes
         */
      });

      api.updateBrush(stageKey, {
        selectedPolys: brush.selectedPolys.slice(),
        selectedMeshes: brush.selectedMeshes.slice(),
      });
    },

    undoRedoPolygons: (stageKey) => {
      const stage = api.getStage(stageKey);
      const { polygon, internal, internal: { prevPolygon } } = stage;
      internal.prevPolygon = polygon;
      stage.polygon = prevPolygon;
      // Must refresh auxiliary polygons 'navigable' and 'walls'
      api.updateNavigable(stageKey);
      api.persist(stageKey);
    },

    updateBrush: (stageKey, updates) => {
      api.updateStage(stageKey, ({ brush }) => ({
        brush: { ...brush,
          ...typeof updates === 'function' ? updates(brush) : updates,
        },
      }));
    },

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

    updateNavigable: (stageKey) => {
      const { walls, polygon, mesh } = api.getStage(stageKey);
      const wallPolys = walls.polygonKeys.flatMap(x => polygon[x].polygons);
      const allPolys = wallPolys.concat(
        Object.values(mesh).map(x => Geom.Polygon.fromRect(x.rect)));
      const { bounds, navPolys } = useGeom.api.createNavMesh(stageKey, allPolys);

      polygon[Stage.CorePolygonKey.navigable].polygons = navPolys;
      polygon[Stage.CorePolygonKey.walls].polygons = wallPolys;
      api.updateStage(stageKey, ({ internal, polygon }) => ({
        internal: { ...internal, bounds },
        polygon: { ...polygon }
      }));
    },

    updateOpts: (stageKey, updates) => {
      api.updateStage(stageKey, ({ opts }) => ({
        opts: { ...opts,
          ...typeof updates === 'function' ? updates(opts) : updates,
        },
      }));
    },

    updatePolygon: (stageKey, polygonKey, updates, mutate) => {
      if (mutate)  {
        const { polygon } = api.getStage(stageKey);
        Object.assign(polygon[polygonKey], updates);
      } else {
        api.updateStage(stageKey, ({ polygon }) => ({
          polygon: updateLookup(polygonKey, polygon, () => updates),
        }));
      }
    },

    updateStage: (stageKey, updates) => {
      set(({ stage }) => ({
        stage: updateLookup(stageKey, stage,
          typeof updates === 'function' ? updates : () => updates,
        ),
      }));
    },

    updateWalls: (stageKey, updates) => {
      get().api.updateStage(stageKey, ({ walls }) => ({
        walls: { ...walls,
          ...typeof updates === 'function' ? updates(walls) : updates,
        },
      }));
    },

  },
}), {
  name: 'stage',
  version: 0,
  blacklist: ['api', 'stage'],
  onRehydrateStorage: (_) =>  {
    return () => {
      useStageStore.setState({ rehydrated: true });
    };
  },
}), 'stage'));

const api = useStore.getState().api;
const useStageStore = Object.assign(useStore, { api });

export default useStageStore;
