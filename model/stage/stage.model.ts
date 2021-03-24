import { Subject } from "rxjs";
import { Vector3, Scene } from "three";
import * as Geom from 'model/geom';
import { PanZoomControls } from 'model/3d/pan-zoom-controls';
import { KeyedLookup } from "../generic.model";
import { geomService } from "../geom.service";

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
  sides: number;
  /** The untransformed brush rect */
  rect: Geom.Rect;
  /** The untransformed brush poly */
  polygon: Geom.Polygon;
  /** Mutated by Brush */
  position: Geom.Vector;
  /** Mutated by Brush */
  scale: Geom.Vector;
}

export function createDefaultBrushMeta(): BrushMeta {
  const sides = 6;
  return {
    shape: 'rect',
    sides,
    rect: Geom.Rect
      .from({ x: 0, y: -1, width: 1, height: 1 }),
    polygon: geomService.createRegularPolygon(sides)
      .translate({ x: 0.5, y: -0.5 }),
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
  /** Attributes, applying to every polygon */
  attrib: Record<string, string | number>;
  // TODO can also contain meshes imported from Blender
}

export const brushRectName = 'rect';
export const brushPolyName = 'poly';

export function computeBrushStyles(shape: BrushMeta['shape']) {
  let rectOpacity = 0.2, polyOpacity = 0.1;
  let rectColor = '#00f', polyColor = '#000';
  if (shape === 'poly') {
    [rectColor, polyColor] = [polyColor, rectColor];
    [rectOpacity, polyOpacity] = [polyOpacity, rectOpacity];
  }
  return { rectOpacity, rectColor, polyOpacity, polyColor };
}

export function computeGlobalBrushPolygon(brush: BrushMeta) {
  const polygon = brush.shape === 'rect'
    ? Geom.Polygon.fromRect(brush.rect)
    : brush.polygon;
  return polygon.clone().scaleBy(brush.scale).moveBy(brush.position);
}
