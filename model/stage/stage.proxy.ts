import useStage from "store/stage.store";
import { BrushMeta, StageMeta } from "./stage.model";

export interface ExtendedBrush extends BrushMeta {
  paint: () => void;
  erase: () => void;
  select: () => void;
  transform: (key: TransformKey) => void;
}

export type TransformKey = 'flip-x' | 'flip-y' | 'rot-cw' | 'rot-acw';

export function createStageProxy(stageKey: string) {
  return new Proxy({} as StageMeta, {
    get(_, key: keyof StageMeta) {
      const stage = useStage.api.getStage(stageKey);

      if (key === 'brush') {
        return new Proxy({} as ExtendedBrush, {
          get(_, key: keyof ExtendedBrush) {
            switch (key) {
              case 'paint': return () => useStage.api.applyBrush(stageKey, {});
              case 'erase': return () => useStage.api.applyBrush(stageKey, { erase: true });
              case 'select': return () => useStage.api.selectBrush(stageKey);
              case 'transform': return (transformKey: TransformKey) =>
                useStage.api.transformBrush(stageKey, transformKey);
              default: return useStage.api.getBrush(stageKey)[key];
            }
          },
          set(_, key: string, value: any) {
            useStage.api.updateBrush(stageKey, { [key]: value });
            return true;
          },
        });
      }

      return stage[key];
    },
    set(_, key: string, value: any) {
      useStage.api.updateStage(stageKey, { [key]: value });
      return true;
    },
    ownKeys: () => Object.keys(useStage.api.getStage(stageKey)),
    getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true })
  });
}
