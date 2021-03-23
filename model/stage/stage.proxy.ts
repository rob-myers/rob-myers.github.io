import useStageStore from "store/stage.store";
import { BrushMeta, StoredStage } from "./stage.model";

export interface ExtendedBrush extends BrushMeta {
  paint: (layer?: string) => void;
  erase: (layer?: string) => void;
}

export function createStageProxy(stageKey: string) {
  return new Proxy({} as StoredStage, {
    get(_, key: keyof StoredStage) {
      const stage = useStageStore.api.getStage(stageKey);
      if (key === 'brush') {
        return new Proxy({} as ExtendedBrush, {
          get(_, key: keyof ExtendedBrush) {
            if (key === 'paint') {
              return (layer?: string) => useStageStore.api.applyBrush(stageKey, { layer });
            } else if (key === 'erase') {
              return (layer?: string) => useStageStore.api.applyBrush(stageKey, { layer, erase: true });
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
