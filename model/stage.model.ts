import { Vector3, Scene } from "three";
import * as Geom from 'model/geom';
import { Subject } from "rxjs";
import { PanZoomControls } from 'model/3d/pan-zoom-controls';

export type StoredStage = {
  key: string;
  /** Can we move/zoom the pan-zoom camera? */
  camEnabled: boolean;
  /** Used to draw rects and regular polygons */
  brush: BrushMeta;
  keyEvents: Subject<StageKeyEvent>;
  /** Attached on mount */
  controls?: PanZoomControls;
  /** Attached on mount */
  scene?: Scene;

  // BELOW WILL CHANGE
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

export interface BrushMeta {
  shape: 'rect' | 'poly';
  mode: 'add' | 'cut';
  sides: number;
}

export const defaultSelectRectMeta: BrushMeta = {
  mode: 'add',
  shape: 'rect',
  sides: 6,
};

export interface StageKeyEvent {
  key: 'keydown' | 'keyup';
  keyName: string;
}
