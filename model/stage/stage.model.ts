import { Subject } from "rxjs";
import * as THREE from "three";
import { Triple } from "model/generic.model";
import * as Geom from "model/geom";
import { PanZoomControls } from "model/3d/pan-zoom-controls";
import { identityMatrix4 } from "model/3d/three.model";

export type StageMeta = {
  key: string;
  /** The internals of the stage */
  internal: StageInternal;
  /** Key-value store for internal use */
  extra: StageExtra;
  /** Important options, also for the CLI */
  opts: StageOpts;
  /** The current selection */
  sel: StageSelection;
  poly: StagePoly;
};

export interface StageInternal {
  /** Keyboard events sent by `Stage`  */
  keyEvents: Subject<StageKeyEvent>;
  /** Attached on mount */
  controls?: PanZoomControls;
  /** Attached by Stage */
  scene?: THREE.Scene;
  /** Auto-computed world bounds */
  bounds: Geom.Rect;
  /** `Cursor` overwrites this */
  cursorGroup: THREE.Group;
}

/** Key-value storage for internal use */
export type StageExtra = Record<string, any> & {
  /** Data url */
  canvasPreview?: string;
  /** Initial camera position */
  initCameraPos: Triple<number>;
  /** Initial cursor position */
  initCursorPos: Triple<number>;
}

/** Keep this flat so stage.proxy handles updates */
export interface StageOpts {
  enabled: boolean;
  /** Can we move/zoom the pan-zoom camera? */
  panZoom: boolean;
  /** CSS background of stage */
  background: string;
  /** Persist on unload window? */
  autoPersist: boolean;
  wallColor: string;
  wallHeight: number
  wallOpacity: number;
}

export interface StageSelection {
  /**
   * The group containing a visual representation of `polygons`.
   * We may also attach semi-transparent meshes here.
   * Its initial value is only used to transmit any existing transform.
   */
  group: THREE.Group;
  /** Is the selection enabled? */
  enabled: boolean;
  /** Is the selection locked? */
  locked: boolean;
  /** Untransformed selection area */
  localBounds: Geom.Rect;
  /** Untransformed selected walls */
  localWall: Geom.Polygon[];
  /** Untransformed selected obs */
  localObs: Geom.Polygon[];
}

/** Serializable `StageSelection` */
interface StageSelectionJson {
  enabled: boolean;
  locked: boolean;
  /** Group transform */
  matrix: number[];
  localBounds: Geom.RectJson;
  localWall: Geom.PolygonJson[];
  localObs: Geom.PolygonJson[];
}

export function createStage(stageKey: string): StageMeta {
  return {
    key: stageKey,
    internal: {
      keyEvents: new Subject,
      bounds: initStageBounds.clone(),
      cursorGroup: new THREE.Group,
      // ...Attached by components
    },
    extra: {
      initCameraPos: [...initCameraPosArray],
      initCursorPos: [...initCursorPos],
      // ...Attached by components
    },
    opts: createStageOpts(),
    sel: {
      group: new THREE.Group,
      locked: false,
      enabled: true,
      localBounds: new Geom.Rect(0, 0, 0, 0),
      localWall: [],
      localObs: [],
    },
    poly: { wall: [], prevWall: [], obs: [], prevObs: [], nav: [] },
  };
}

export function createStageOpts(): StageOpts {
  return {
    enabled: true,
    panZoom: true,
    background: '#eee',
    autoPersist: true,
    wallColor: '#000',
    wallHeight: 1,
    wallOpacity: 1,
  };
}

export type StagePoly = Record<(
  | 'wall'  | 'prevWall' // walls
  | 'obs' | 'prevObs' // obstructions
  | 'nav'  // navigable
), Geom.Polygon[]>;

export interface PersistedStage {
  key: string;
  opts: StageOpts;
  extra: StageExtra;
  sel: StageSelectionJson;
  poly: Record<(
    | 'wall' // walls
    | 'obs'  // additional obstructions
  ), Geom.PolygonJson[]>;
}

export function createPersist(stageKey: string): PersistedStage {
  return {
    key: stageKey,
    opts: createStageOpts(),
    extra: {
      initCameraPos: [...initCameraPosArray],
      initCursorPos: [...initCursorPos],
    },
    sel: {
      locked: false,
      enabled: true,
      matrix: identityMatrix4.toArray(),
      localBounds: new Geom.Rect(0, 0, 0, 0).json,
      localObs: [],
      localWall: [],
    },
    poly: { wall: [], obs: [] },
  };
}

export type StageKeyEvent = Pick<KeyboardEvent, (
  | 'key'
  | 'metaKey'
  | 'shiftKey'
  | 'type'
)> & {
  type: 'keydown' | 'keyup';
};

export type StagePointerEvent = {
  /** Position on ground */
  point: THREE.Vector3;
} & (
  | { key: 'pointerdown' }
  | { key: 'pointerup' }
  | { key: 'pointerleave' }
  | { key: 'pointermove' }
);

const initCameraPosArray: Triple<number> = [0, 0, 10];
export const initCameraPos = new THREE.Vector3(...initCameraPosArray);
export const initCursorPos: Triple<number> = [0, 0, 0];
export const initStageBounds = new Geom.Rect(0, 0, 0, 0);
