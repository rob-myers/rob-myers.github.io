import useStage from "store/stage.store";
import { BrushMeta, StageMeta } from "./stage.model";

export interface ExtendedBrush extends BrushMeta {
  paint: () => void;
  erase: () => void;
  select: () => void;
  deselect: () => void;
  cutSelect: () => void;
  transform: (key: TransformKey) => void;
  undoRedo: () => void;
}

export type TransformKey = 'mirror(x)' | 'mirror(y)' | 'rotate(90)' | 'rotate(-90)';

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
              case 'select': return () => useStage.api.selectPolysInBrush(stageKey);
              case 'deselect': return () => useStage.api.deselectPolysInBrush(stageKey);
              case 'cutSelect': return () => useStage.api.cutSelectPolysInBrush(stageKey);
              case 'transform': return (transformKey: TransformKey) =>
                useStage.api.transformBrush(stageKey, transformKey);
              case 'undoRedo': return () => useStage.api.undoRedoBrush(stageKey);
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
