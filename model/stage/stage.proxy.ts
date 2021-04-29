import * as Geom from "model/geom";
import { geom } from "model/geom.service";
import useStage from "store/stage.store";
import { StageMeta, stageNavInset, StageOpts, StagePoly, StageSelection } from "./stage.model";

export function createStageProxy(stageKey: string) {
  return new Proxy({} as StageMeta, {
    get(_, key: keyof StageMeta | 'cursor') {
      const stage = useStage.api.getStage(stageKey);

      if (key === 'poly') {
        return new Proxy({} as StagePoly, {
          get(_, key: keyof StagePoly) {
            return useStage.api.getStage(stageKey).poly[key];
          },
          set(_, key: keyof StagePoly, value: any) {
            if (key === 'wall' || key === 'obs') {
              const { poly } = useStage.api.getStage(stageKey);
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
          ownKeys: () => Object.keys(useStage.api.getStage(stageKey).poly),
          getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true })
        });
      } else if (key === 'sel') {
        return new Proxy({} as StageSelection, {
          get(_, key: keyof StageSelection | 'bounds' | 'wall' | 'obs') {
            if (key === 'bounds') {// Provide world bounds
              const { localBounds, group: { matrix } } = useStage.api.getStage(stageKey).sel;
              return geom.applyMatrixRect(matrix, localBounds.clone()).precision(1);
            } else if (key === 'wall' || key === 'obs') {// Provide world polygons
              const { localWall, localObs, group: { matrix } } = useStage.api.getStage(stageKey).sel;
              return (key === 'wall' ? localWall : localObs)
                .map(x => geom.applyMatrixPoly(matrix, x.clone()).precision(1));
            }
            return useStage.api.getStage(stageKey).sel[key];
          },
          set(_, key: keyof StageSelection | 'wall' | 'obs', value: any) {
            if (key === 'wall' || key === 'obs') {// Given world polygons, set untransformed polygons
              const { group } = useStage.api.getStage(stageKey).sel;
              const matrix = group.matrix.clone().invert();
              const next = (value as Geom.Polygon[]).map(x => geom.applyMatrixPoly(matrix, x.clone()).precision(1));
              useStage.api.updateSel(stageKey, key === 'wall' ? { localWall: next } : { localObs: next });
              return true;
            }
            useStage.api.updateSel(stageKey, { [key]: value });
            return true;
          },
          ownKeys: () => Object.keys(useStage.api.getStage(stageKey).sel)
            .concat('bounds', 'wall', 'obs'),
          getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true })
        });
      } else if (key === 'opts') {
        return new Proxy({} as StageOpts, {
          get(_, key: keyof StageOpts) {
            return useStage.api.getStage(stageKey).opts[key];
          },
          set(_, key: string, value: any) {
            useStage.api.updateOpts(stageKey, { [key]: value });
            return true;
          },
          ownKeys: () => Object.keys(useStage.api.getStage(stageKey).opts),
          getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true })
        });
      }  else if (key === 'cursor') {
        return stage.internal.cursorGroup.position;
      }

      return stage[key];
    },
    set(_, _key: keyof StageMeta, _value: any) {
      throw Error('Cannot set top-level key of stage');
    },
    ownKeys: () => Object.keys(useStage.api.getStage(stageKey))
      .concat('cursor'),
    getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true }),
    deleteProperty: (_, _key: keyof StageMeta) => {
      throw Error('Cannot delete top-level key of stage');
    },
  });
}
