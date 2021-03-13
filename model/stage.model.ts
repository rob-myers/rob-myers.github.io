import { Vector3, Scene } from "three";
import * as Geom from 'model/geom';
import { PanZoomControls } from 'model/3d/pan-zoom-controls';

export type StoredStage = {
  key: string;
  /** Is this camera enabled? */
  camEnabled: boolean;
  selector: SelectRectMeta;
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

export interface SelectRectMeta {
  shape: 'rect' | 'brush';
  mode: 'add' | 'remove';
  sides: number;
}

export const defaultSelectRectMeta: SelectRectMeta = {
  mode: 'add',
  shape: 'rect',
  sides: 6,
};
