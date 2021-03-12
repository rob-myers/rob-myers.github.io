import { Vector3, Scene } from "three";
import * as Geom from 'model/geom';
import { PanZoomControls } from 'model/3d/pan-zoom-controls';
import { Subject } from 'rxjs';

export type StoredStage = {
  key: string;
  /** Is this camera enabled? */
  camEnabled: boolean;
  selectRectMeta: SelectRectMeta;
  /** Send messages to stage here */
  input: Subject<StageMsg>;
  /** Attached on mount */
  controls?: PanZoomControls;
  /** Attached on mount */
  scene?: Scene;
  /** Currently selected polygon */
  selectPolys: Geom.Polygon[];
  /** Base of walls. */
  wallPolys: Geom.Polygon[];
};

export interface PersistedStage {
  key: string;
  // TODO
}

export const initCameraPos = new Vector3(0, 0, 10);

export type StageMsg = (
  { key: 'set-brush-sides'; args: [number] }
);

export interface SelectRectMeta {
  shape: 'rect' | 'brush';
  mode: 'add' | 'remove';
  brushPolySides: number;
}

export const defaultSelectRectMeta: SelectRectMeta = {
  shape: 'rect',
  brushPolySides: 6,
  mode: 'add',
};

export function handleStageInput(
  stageKey: string,
  subject: StoredStage['input'],
): StoredStage['input'] {
  // TODO
  return subject;
}
