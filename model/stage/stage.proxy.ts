import useStageStore from "store/stage.store";
import { BrushMeta, StageMeta } from "./stage.model";

export interface ExtendedBrush extends BrushMeta {
  paint: (layer?: string) => void;
  erase: (layer?: string) => void;
}

export function createStageProxy(stageKey: string) {
  return new Proxy({} as StageMeta, {
    get(_, key: keyof StageMeta) {
      const stage = useStageStore.api.getStage(stageKey);
      if (key === 'brush') {
        return new Proxy({} as ExtendedBrush, {
          get(_, key: keyof ExtendedBrush) {
            if (key === 'paint') {
              return (polygonKey = 'default') =>
                useStageStore.api.applyBrush(stageKey, { polygonKey });
            } else if (key === 'erase') {
              return (polygonKey = 'default') =>
                useStageStore.api.applyBrush(stageKey, { polygonKey, erase: true });
            } else {
              return useStageStore.api.getBrush(stageKey)[key];
            }
          },
          set(_, key: string, value: any) {
            useStageStore.api.updateBrush(stageKey, { [key]: value });
            return true;
          },
        });
      }
      return stage[key];
    },
    set(_, key: string, value: any) {
      useStageStore.api.updateStage(stageKey, { [key]: value });
      return true;
    },
    ownKeys: () => Object.keys(useStageStore.api.getStage(stageKey)),
    getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true })
  });
}
