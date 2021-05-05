import * as THREE from "three";
import { firstAvailableInteger } from "model/generic.model";
import * as Geom from "model/geom";
import { geom } from "model/geom.service";
import * as Stage from "./stage.model";
import useStage from "store/stage.store";

export function createStageProxy(stageKey: string) {
  const stage = () => useStage.api.getStage(stageKey);
  return new Proxy({} as Stage.StageMeta, {
    get(_, key: keyof Stage.StageMeta | 'cursor') {
      if (key === 'poly') {
        return new Proxy({} as Stage.StagePoly, {
          get(_, key: keyof Stage.StagePoly | 'update') {
            if (key === 'update') {
              return (updates: Partial<Stage.StagePoly> = {}) => {
                useStage.api.updatePoly(stageKey, updates);
                setTimeout(() => {// TODO trigger nav computation elsewhere
                  const {poly} = useStage.api.getStage(stageKey);
                  poly.nav = geom.navFromUnnavigable(poly.wall.concat(poly.obs), Stage.stageNavInset);
                });
              };
            }
            return stage().poly[key];
          },
          set(_, key: keyof Stage.StagePoly, value: any) {
            useStage.api.updatePoly(stageKey, { [key]: value });
            return true;
          },
          ownKeys: () => Object.keys(stage().poly),
          getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true })
        });
      } else if (key === 'sel') {
        return new Proxy({} as Stage.StageSelection, {
          get(_, key: keyof Stage.StageSelection | 'bounds' | 'wall' | 'obs') {
            if (key === 'bounds') {// Provide world bounds
              const { localBounds, group: { matrix } } = stage().sel;
              return geom.applyMatrixRect(matrix, localBounds.clone()).precision(1);
            } else if (key === 'wall' || key === 'obs') {// Provide world polygons
              const { localWall, localObs, group: { matrix } } = stage().sel;
              return (key === 'wall' ? localWall : localObs)
                .map(x => geom.applyMatrixPoly(matrix, x.clone()).precision(1));
            }
            return stage().sel[key];
          },
          set(_, key: keyof Stage.StageSelection | 'wall' | 'obs', value: any) {
            if (key === 'wall' || key === 'obs') {// Given world polygons, set untransformed polygons
              const { group } = stage().sel;
              const matrix = group.matrix.clone().invert();
              const next = (value as Geom.Polygon[]).map(x => geom.applyMatrixPoly(matrix, x.clone()).precision(1));
              useStage.api.updateSel(stageKey, key === 'wall' ? { localWall: next } : { localObs: next });
              return true;
            }
            useStage.api.updateSel(stageKey, { [key]: value });
            return true;
          },
          ownKeys: () => Object.keys(stage().sel)
            .concat('bounds', 'wall', 'obs'),
          getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true })
        });
      } else if (key === 'opt') {
        return new Proxy({} as Stage.StageOpts, {
          get(_, key: keyof Stage.StageOpts) {
            return stage().opt[key];
          },
          set(_, key: string, value: any) {
            useStage.api.updateOpt(stageKey, { [key]: value });
            return true;
          },
          ownKeys: () => Object.keys(stage().opt),
          getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true })
        });
      } else if (key === 'light') {
        return new Proxy({} as Stage.StageLight, {
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
        return new Proxy({} as Stage.StageBot, {
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
                  clips,
                  mixer: new THREE.AnimationMixer(group),
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
    deleteProperty: (_, _key: keyof Stage.StageMeta) => {
      throw Error('cannot delete top-level key of stage');
    },
  });
}
