import { Vector3, Scene } from "three";
import * as Geom from 'model/geom';
import { Subject } from "rxjs";
import { PanZoomControls } from 'model/3d/pan-zoom-controls';
import { KeyedLookup } from "./generic.model";

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

  /** The layers in this stage */
  layer: KeyedLookup<StageLayer>;
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

export const defaultBrushMeta: BrushMeta = {
  mode: 'add',
  shape: 'rect',
  sides: 6,
};

export interface StageKeyEvent {
  /**` KeyboardEvent.type` */
  event: 'keydown' | 'keyup';
  /** `KeyboardEvent.key` */
  key: string;
}

export interface StageLayer {
  key: string;
  /** An array of multipolygons */
  polygons: Geom.Polygon[];
  /** Attributes, applying to every polygon */
  attrib: Record<string, string | number>;
  // TODO can also contain meshes imported from Blender
}
