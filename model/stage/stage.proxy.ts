import * as Geom from "model/geom";
import { geom } from "model/geom.service";
import useStage from "store/stage.store";
import { StageMeta, StageOpts, StagePoly, StageSelection } from "./stage.model";

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
            useStage.api.updatePoly(stageKey, { [key]: value });
            return true;
          },
          ownKeys: () => Object.keys(useStage.api.getStage(stageKey).poly),
          getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true })
        });
      } else if (key === 'sel') {
        return new Proxy({} as StageSelection, {
          get(_, key: keyof StageSelection | 'bounds' | 'localBounds' | 'polygons') {
            if (key === 'bounds' || key === 'localBounds') {
              /**
               * Provide world bounds or untransformed bounds.
               */
              const { localPolys, group: { matrix } } = useStage.api.getStage(stageKey).sel;
              const bounds = geom.unionRects(localPolys.map(x => x.rect));
              return key === 'bounds'
                ? geom.applyMatrixRect(matrix, bounds).precision(1)
                : bounds.precision(1);
            } else if (key === 'polygons') {
              /**
               * Provide world polygons.
               */
              const { localPolys, group: { matrix } } = useStage.api.getStage(stageKey).sel;
              return localPolys.map(x => geom.applyMatrixPoly(matrix, x.clone()).precision(1));
            }
            return useStage.api.getStage(stageKey).sel[key];
          },
          set(_, key: keyof StageSelection | 'polygons', value: any) {
            if (key === 'polygons') {
              /**
               * Given world polygons, set untransformed polygons.
               */
              const { group } = useStage.api.getStage(stageKey).sel;
              const matrix = group.matrix.clone().invert();
              const nextPolys = (value as Geom.Polygon[]).map(x => geom.applyMatrixPoly(matrix, x.clone()).precision(1));
              useStage.api.updateSel(stageKey, { localPolys: nextPolys });
              return true;
            }
            useStage.api.updateSel(stageKey, { [key]: value });
            return true;
          },
          ownKeys: () => Object.keys(useStage.api.getStage(stageKey).sel)
            .concat('bounds', 'localBounds', 'polygons'),
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
    getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true })
  });
}
