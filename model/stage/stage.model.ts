import { Subject } from "rxjs";
import { Vector3, Scene } from "three";
import { KeyedLookup } from "model/generic.model";
import * as Geom from 'model/geom';
import { PanZoomControls } from 'model/3d/pan-zoom-controls';

export type StageMeta = {
  key: string;
  /** Stuff the CLI usually would not access */
  internal: {
    /** Can we move/zoom the pan-zoom camera? */
    camEnabled: boolean;
    keyEvents: Subject<StageKeyEvent>;
    /** Attached on mount */
    controls?: PanZoomControls;
    /** Attached on mount */
    scene?: Scene;
  };
  /** Transparency in range [0,1] */
  opacity: number;
  /** Can suppress high walls */
  height: number;
  /** Used to select rectangles and move templates */
  brush: BrushMeta;
  /** Polygon storage */
  polygon: KeyedLookup<NamedPolygons>;
  /** A block is an extruded polygon blocking the view/way */
  block: KeyedLookup<StageBlock>;
};

export interface PersistedStage {
  key: string;
  /**
   * TODO
   */
}

//#region internal
export interface StageKeyEvent {
  /**` KeyboardEvent.type` */
  event: 'keydown' | 'keyup';
  /** `KeyboardEvent.key` */
  key: string;
}

export const initCameraPos = new Vector3(0, 0, 10);
//#endregion

export interface BrushMeta {
  /** The untransformed brush rect */
  rect: Geom.Rect;
  /** Mutated by Brush */
  position: Geom.Vector;
  /** Mutated by Brush */
  scale: Geom.Vector;
  /** Is the selection locked? */
  locked: boolean;
  /** Current polygon key we add/cut blocks out of */
  polygonKey: string;

  selection: SelectedPolygons[];
  /** Last position we started selection from */
  selectFrom: Vector3;
}

export function createDefaultBrushMeta(): BrushMeta {
  const sides = 6;
  return {
    rect: new Geom.Rect(0, -1, 1, 1),
    position: new Geom.Vector,
    scale: new Geom.Vector(1, 1),
    locked: false,
    polygonKey: 'default',
    selection: [],
    selectFrom: new Vector3,
  };
};

export interface NamedPolygons {
  key: string;
  polygons: Geom.Polygon[];
}

export function createNamedPolygons(key: string): NamedPolygons {
  return { key, polygons: [] };
}

export function createStageBlock(key: string, opts: Partial<StageBlock>): StageBlock {
  return {
    key,
    color: '#000',
    height: 10,
    polygonKeys: [],
    visible: true,
    ...opts,
  };
}

export interface StageBlock {
  key: string;
  /** Keys of NamedPolygons */
  polygonKeys: string[];
  /** Height of top of extruded polygon  */
  height: number;
  color: string;
  visible: boolean;
}

export function getGlobalBrushRect(brush: BrushMeta): Geom.Polygon {
  return Geom.Polygon.fromRect(brush.rect)
    .scaleBy(brush.scale).add(brush.position);
}

export interface SelectedPolygons {
  /** Selected from this polygon */
  polygonKey: string;
  polygons: Geom.Polygon[];
}
