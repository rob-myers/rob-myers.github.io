import { geom } from "model/geom.service";
import useStage from "store/stage.store";
import { StageMeta, StageOpts, StageSelection } from "./stage.model";


export function createStageProxy(stageKey: string) {
  return new Proxy({} as StageMeta, {
    get(_, key: keyof StageMeta | 'cursor') {
      const stage = useStage.api.getStage(stageKey);

      if (key === 'opts') {
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
      } else if (key === 'selection') {
        return new Proxy({} as StageSelection, {
          get(_, key: keyof StageSelection | 'bounds') {
            if (key === 'bounds') {
              const { polygons, group } = useStage.api.getStage(stageKey).selection;
              const bounds = geom.unionRects(polygons.map(x => x.rect));
              return geom.applyMatrixRect(group.matrix, bounds).precision(1);
            }
            return useStage.api.getStage(stageKey).selection[key];
          },
          set(_, key: string, value: any) {
            useStage.api.updateSelection(stageKey, { [key]: value });
            return true;
          },
          ownKeys: () => Object.keys(
            useStage.api.getStage(stageKey).selection
          ).concat('bounds'),
          getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true })
        });
      } else if (key === 'cursor') {
        return stage.extra.cursorGroup?.position;
      }

      return stage[key];
    },
    set(_, _key: keyof StageMeta, _value: any) {
      throw Error('Cannot set top-level key of stage');
    },
    ownKeys: () => Object.keys(
      useStage.api.getStage(stageKey)
    ).concat('cursor'),
    getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true })
  });
}
