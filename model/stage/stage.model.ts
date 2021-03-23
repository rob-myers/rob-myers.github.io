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
  bounds: Geom.Rect,
  polygon: Geom.Polygon;
  /** Attached on mount */
  group: null | THREE.Group;
}

export const defaultBrushMeta: BrushMeta = {
  shape: 'rect',
  sides: 6,
  bounds: new Geom.Rect(0, 0, 0, 0),
  polygon: new Geom.Polygon,
  group: null,
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

export function computeBrushGeom(group: THREE.Group) {
  const polyMesh = group.getObjectByName(brushPolyName) as THREE.Mesh;
  const polyVs = geomService.getVertices(polyMesh);
  const polygon = Geom.Polygon.from({ outline: polyVs.slice(1).map(({ x, y }) => ({ x, y })) });
  polygon.cleanFinalReps();

  const rectMesh = (group.getObjectByName(brushRectName) as THREE.Mesh);
  const rectVs = geomService.getVertices(rectMesh);
  const { rect } = Geom.Polygon.from({ outline: rectVs.map(({ x, y }) => ({ x, y })) });

  return { bounds: rect, polygon };
}
