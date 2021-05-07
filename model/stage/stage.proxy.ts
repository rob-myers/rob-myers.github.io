import * as THREE from "three";
import { firstAvailableInteger } from "model/generic.model";
import { geom } from "model/geom.service";
import { BotController } from "model/3d/bot-controller";
import * as Stage from "./stage.model";
import useStage from "store/stage.store";
import useGeomStore from "store/geom.store";

export function createStageProxy(stageKey: string) {
  const stage = () => useStage.api.getStage(stageKey);
  return new Proxy({} as Stage.StageMeta, {
    deleteProperty: (_, _key: keyof Stage.StageMeta) => {
      throw Error('cannot delete top-level key of stage');
    },
    get(_, key: keyof Stage.StageMeta | 'cursor') {
      if (key === 'poly') {
        return new Proxy({} as Stage.StagePolyLookup, {
          get(_, key: keyof Stage.StagePolyLookup | 'update') {
            if (key === 'update') {
              return (updates: Partial<Stage.StagePolyLookup> = {}) => {
                useStage.api.updatePoly(stageKey, updates);
                setTimeout(() => {
                  useStage.api.updatePoly(stageKey, (poly) => {
                    const nav = geom.computeNavPoly(poly.wall, poly.obs, Stage.stageNavInset);
                    useGeomStore.api.createNavMesh(stageKey, nav);
                    return {nav};
                  });
                }, 10);
              };
            }
            return stage().poly[key];
          },
          set(_, key: keyof Stage.StagePolyLookup, value: any) {
            useStage.api.updatePoly(stageKey, { [key]: value });
            return true;
          },
          ownKeys: () => Object.keys(stage().poly),
          getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true })
        });
      } else if (key === 'sel') {
        return new Proxy({} as Stage.StageSelection, {
          get(_, key: (
            | keyof Stage.StageSelection
            | 'bounds' | 'wall' | 'obs' | 'update'
          )) {
            if (key === 'bounds') {// Provide world bounds
              const { localBounds, group: { matrix } } = stage().sel;
              return geom.applyMatrixRect(matrix, localBounds.clone()).precision(1);
            } else if (key === 'wall' || key === 'obs') {// Provide world polygons
              const { localWall, localObs, group: { matrix } } = stage().sel;
              return (key === 'wall' ? localWall : localObs)
                .map(x => geom.applyMatrixPoly(matrix, x.clone()).precision(1));
            } else if (key === 'update') {
              return (updates: Partial<Stage.StageSelection> = {}) =>
                useStage.api.updateSel(stageKey, updates);
            }
            return stage().sel[key];
          },
          set(_, key: keyof Stage.StageSelection, value: any) {
            useStage.api.updateSel(stageKey, { [key]: value });
            return true;
          },
          ownKeys: () => Object.keys(stage().sel)
            .concat('bounds', 'wall', 'obs'),
          getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true })
        });
      } else if (key === 'opt') {
        return new Proxy({} as Stage.StageOpts, {
          deleteProperty: (_, _key: string) => {
            throw Error(`cannot delete option`);
          },
          get(_, key: keyof Stage.StageOpts) {
            return stage().opt[key];
          },
          set(_, key: string, value: any) {
            if (!Stage.stageOptKeys.includes(key))
              throw Error(`unknown stage option ${key}`);
            useStage.api.updateOpt(stageKey, { [key]: value });
            return true;
          },
          ownKeys: () => Object.keys(stage().opt),
          getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true }),
        });
      } else if (key === 'light') {
        return new Proxy({} as Stage.StageLightLookup, {
          get(_, key: string | 'add' | 'update') {
            if (key === 'add') {
              return (light: THREE.SpotLight) => {
                light.name = `light${firstAvailableInteger(
                  Object.keys(stage().light).filter(x => /^light\d+$/).map(x => Number(x.slice(5)))
                )}`;
                useStage.api.updateLight(stageKey, { [light.name]: light });
              };
            } else if (key === 'update') {
              return () => useStage.api.updateLight(stageKey, {});
            }
            return stage().light[key];
          },
          set(_, key: string, value: any) {
            useStage.api.updateLight(stageKey, { [key]: value });
            return true;
          },
          ownKeys: () => Object.keys(stage().light),
          getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true }),
          deleteProperty: (_, key: string) => {
            useStage.api.updateLight(stageKey, { [key]: undefined });
            return true;
          },
        });
      } else if (key === 'bot') {
        return new Proxy({} as Stage.StageBotLookup, {
          deleteProperty: (_, key: string) => {
            useStage.api.updateBot(stageKey, { [key]: undefined });
            return true;
          },
          get(_, key: string | 'add') {
            if (key === 'add') {
              return (group: THREE.Group, clips: THREE.AnimationClip[]) => {
                group.name = `bot${firstAvailableInteger(
                  Object.keys(stage().bot).filter(x => /^bot\d+$/).map(x => Number(x.slice(3)))
                )}`;
                useStage.api.updateBot(stageKey, { [group.name]: {
                  name: group.name,
                  group,
                  controller: new BotController(group, clips),
                } });
              };
            }
            return stage().bot[key];
          },
          getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true }),
          ownKeys: () => Object.keys(stage().bot),
          set(_, key: string, value: any) {
            useStage.api.updateBot(stageKey, { [key]: value });
            return true;
          },
        });
      } else if (key === 'cursor') {
        return stage().internal.cursor.position;
      }
      return stage()[key];
    },
    set(_, _key: keyof Stage.StageMeta, _value: any) {
      throw Error('cannot set top-level key of stage');
    },
    ownKeys: () => Object.keys(stage()).concat('cursor'),
    getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true }),
  });
}
