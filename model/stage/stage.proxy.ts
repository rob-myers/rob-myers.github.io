import useStage from "store/stage.store";
import { BrushMeta, StageMeta, StageOpts, StageWalls } from "./stage.model";

export interface ExtendedBrush extends BrushMeta {
  paint: () => void;
  erase: () => void;
  select: () => void;
  deselect: () => void;
  cutSelect: () => void;
  transform: (key: TransformKey) => void;
  undoRedo: () => void;
}

export type TransformKey = (
  | 'mirror(x)'
  | 'mirror(y)'
  | 'rotate(90)'
  | 'rotate(-90)'
);

export function createStageProxy(stageKey: string) {
  return new Proxy({} as StageMeta, {
    get(_, key: keyof StageMeta) {
      const stage = useStage.api.getStage(stageKey);

      if (key === 'brush') {
        return new Proxy({} as ExtendedBrush, {
          get(_, key: keyof ExtendedBrush) {
            switch (key) {
              case 'paint': return () => useStage.api.applyBrush(stageKey, { erase: false });
              case 'erase': return () => useStage.api.applyBrush(stageKey, { erase: true });
              case 'select': return () => useStage.api.selectWithBrush(stageKey);
              case 'deselect': return () => useStage.api.deselectBrush(stageKey);
              case 'cutSelect': return () => useStage.api.cutWithBrush(stageKey);
              case 'transform': return (transformKey: TransformKey) =>
                useStage.api.transformBrush(stageKey, transformKey);
              case 'undoRedo': return () => useStage.api.undoRedoPolygons(stageKey);
              default:
                return useStage.api.getStage(stageKey).brush[key];
            }
          },
          set(_, key: string, value: any) {
            useStage.api.updateBrush(stageKey, { [key]: value });
            return true;
          },
        });
      } else if (key === 'walls') {
        return new Proxy({} as StageWalls, {
          get(_, key: keyof StageWalls) {
            return useStage.api.getStage(stageKey).walls[key];
          },
          set(_, key: string, value: any) {
            useStage.api.updateWalls(stageKey, { [key]: value });
            return true;
          },
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
