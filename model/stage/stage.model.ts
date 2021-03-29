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
  sides: number;
  /** The untransformed brush rect */
  rect: Geom.Rect;
  /** Mutated by Brush */
  position: Geom.Vector;
  /** Mutated by Brush */
  scale: Geom.Vector;
  /** Is the selection locked? */
  locked: boolean;
  selection: SelectedBlock[];
  /** Current polygon key we add/cut blocks out of */
  polygonKey: string;
}

export function createDefaultBrushMeta(): BrushMeta {
  const sides = 6;
  return {
    sides,
    rect: Geom.Rect.from({ x: 0, y: -1, width: 1, height: 1 }),
    position: Geom.Vector.from({ x: 0, y: 0 }),
    scale: Geom.Vector.from({ x: 1, y: 1 }),
    locked: false,
    selection: [],
    polygonKey: 'default',
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

export function computeGlobalBrushRect(brush: BrushMeta): Geom.Polygon {
  return Geom.Polygon.fromRect(brush.rect)
    .scaleBy(brush.scale).add(brush.position);
}

export interface SelectedBlock {
  blockKey: string;
  polygons: Geom.Polygon[];
}
