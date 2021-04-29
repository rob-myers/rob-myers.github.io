import { firstAvailableInteger } from "model/generic.model";
import * as Geom from "model/geom";
import { geom } from "model/geom.service";
import useStage from "store/stage.store";
import { StageLight, StageMeta, stageNavInset, StageOpts, StagePoly, StageSelection } from "./stage.model";

/**
 * TODO one proxy per stage?
 * TODO cache inner proxies too?
 */
export function createStageProxy(stageKey: string) {
  const stage = () => useStage.api.getStage(stageKey);
  return new Proxy({} as StageMeta, {
    get(_, key: keyof StageMeta) {
      if (key === 'poly') {
        return new Proxy({} as StagePoly, {
          get(_, key: keyof StagePoly) {
            return stage().poly[key];
          },
          set(_, key: keyof StagePoly, value: any) {
            if (key === 'wall' || key === 'obs') {
              const { poly } = stage();
              poly[key === 'wall' ? 'prevWall' : 'prevObs'] = poly[key];
              poly[key] = value;
              useStage.api.updatePoly(stageKey, {
                nav: geom.navFromUnnavigable(poly.wall.concat(poly.obs), stageNavInset),
              });
            } else {
              useStage.api.updatePoly(stageKey, { [key]: value });
            }
            return true;
          },
          ownKeys: () => Object.keys(stage().poly),
          getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true })
        });
      } else if (key === 'sel') {
        return new Proxy({} as StageSelection, {
          get(_, key: keyof StageSelection | 'bounds' | 'wall' | 'obs') {
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
          set(_, key: keyof StageSelection | 'wall' | 'obs', value: any) {
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
      } else if (key === 'opts') {
        return new Proxy({} as StageOpts, {
          get(_, key: keyof StageOpts) {
            return stage().opts[key];
          },
          set(_, key: string, value: any) {
            useStage.api.updateOpts(stageKey, { [key]: value });
            return true;
          },
          ownKeys: () => Object.keys(stage().opts),
          getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true })
        });
      } else if (key === 'light') {
        return new Proxy({} as StageLight, {
          get(_, key: string | 'add' | 'update') {
            if (key === 'add') {
              return (light: THREE.SpotLight) => {
                light.name = `light${firstAvailableInteger(
                  Object.keys(stage().light).filter(x => /^light\d+$/)
                    .map(x => Number(x.slice(5)))
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
      }
      return stage()[key];
    },
    set(_, _key: keyof StageMeta, _value: any) {
      throw Error('Cannot set top-level key of stage');
    },
    ownKeys: () => Object.keys(stage()),
    getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true }),
    deleteProperty: (_, _key: keyof StageMeta) => {
      throw Error('Cannot delete top-level key of stage');
    },
  });
}
