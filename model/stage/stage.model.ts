import { Subject } from "rxjs";
import { Vector3, Scene } from "three";
import * as Geom from 'model/geom';
import { PanZoomControls } from 'model/3d/pan-zoom-controls';
import { KeyedLookup } from "../generic.model";

export type StageMeta = {
  key: string;
  internal: {
    /** Can we move/zoom the pan-zoom camera? */
    camEnabled: boolean;
    keyEvents: Subject<StageKeyEvent>;
    /** Attached on mount */
    controls?: PanZoomControls;
    /** Attached on mount */
    scene?: Scene;

  };
  /** Select rects and move templates */
  brush: BrushMeta;

  /** The layers in this stage */
  layer: KeyedLookup<StageLayer>;
};

export interface PersistedStage {
  key: string;
  // TODO
}

export const initCameraPos = new Vector3(0, 0, 10);

export interface BrushMeta {
  sides: number;
  /** The untransformed brush rect */
  rect: Geom.Rect;
  /** Mutated by Brush */
  position: Geom.Vector;
  /** Mutated by Brush */
  scale: Geom.Vector;
}

export function createDefaultBrushMeta(): BrushMeta {
  const sides = 6;
  return {
    sides,
    rect: Geom.Rect.from({ x: 0, y: -1, width: 1, height: 1 }),
    position: Geom.Vector.from({ x: 0, y: 0 }),
    scale: Geom.Vector.from({ x: 1, y: 1 }),
  };
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
  /** Attributes which apply to every polygon */
  attrib: {
    type: 'area' | 'low-wall' | 'high-wall';
    editFlat: boolean;
  };
  // TODO can also contain meshes imported from Blender
}

export function createStageLayer(key: string): StageLayer {
  return {
    key,
    polygons: [],
    attrib: {
      type: 'low-wall',
      editFlat: false,
    },
  };
}

export const brushRectName = 'rect';

export function computeGlobalBrushRect(brush: BrushMeta) {
  return brush.rect.clone()
    .scaleBy(brush.scale)
    .translate(brush.position);
}
