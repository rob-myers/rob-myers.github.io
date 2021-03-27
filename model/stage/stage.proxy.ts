import useStage from "store/stage.store";
import { BrushMeta, StageMeta } from "./stage.model";

export interface ExtendedBrush extends BrushMeta {
  paint: (polygonKey?: string) => void;
  erase: (polygonKey?: string) => void;
  select: () => void;
}

export function createStageProxy(stageKey: string) {
  return new Proxy({} as StageMeta, {
    get(_, key: keyof StageMeta) {
      const stage = useStage.api.getStage(stageKey);

      if (key === 'brush') {
        return new Proxy({} as ExtendedBrush, {
          get(_, key: keyof ExtendedBrush) {
            if (key === 'paint') {
              return (polygonKey = 'default') =>
                useStage.api.applyBrush(stageKey, { polygonKey });
            } else if (key === 'erase') {
              return (polygonKey = 'default') =>
                useStage.api.applyBrush(stageKey, { polygonKey, erase: true });
            } else if (key === 'select') {
              return () => useStage.api.toggleBrushLock(stageKey);
            } else {
              return useStage.api.getBrush(stageKey)[key];
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
