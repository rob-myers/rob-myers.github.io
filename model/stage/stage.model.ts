import { Subject } from "rxjs";
import * as THREE from "three";
import { Triple } from "model/generic.model";
import * as Geom from "model/geom";
import { PanZoomControls } from "model/3d/pan-zoom-controls";

export type StageMeta = {
  key: string;
  /** The internals of the stage */
  internal: StageInternal;
  /** Key-value store for internal use */
  extra: StageExtra;
  /** Important options, also for the CLI */
  opts: StageOpts;
  /** The current selection */
  selection: StageSelection;
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
}

/** Key-value storage for internal use */
export type StageExtra = Record<string, any> & {
  /** Data url */
  canvasPreview?: string;
  /** Initial camera position */
  initCameraPos: Triple<number>;
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
}

export interface StageSelection {
  /**
   * The root group of the Selection component.
   * We may wish to attach semi-transparent meshes here.
   */
  group?: THREE.Group;
  /** Currently selected polygons */
  polygons: Geom.Polygon[];
  /** Last cursor position */
  lastCursor: Geom.Vector;
  /** Last rectangle selector */
  lastRect: Geom.Rect;
  /** Which kind of selection are we using? */
  selector: SelectorMode; 
  /** Is the selector locked? */
  locked: boolean;
}

type SelectorMode = 'crosshair' | 'rectangle' | 'rectilinear';

interface StageSelectionJson {
  polygons: Geom.PolygonJson[];
  cursor: Geom.VectorJson;
  rect: Geom.RectJson;
  selector: SelectorMode;
  locked: boolean;
}

export function createStage(stageKey: string): StageMeta {
  return {
    key: stageKey,
    internal: {
      keyEvents: new Subject,
      bounds: initStageBounds.clone(),
      // ...Other stuff is attached by components
    },
    extra: {
      initCameraPos: [...initCameraPosArray],
    },
    opts: createStageOpts(),
    selection: {
      group: new THREE.Group,
      polygons: [],
      lastCursor: new Geom.Vector,
      lastRect: new Geom.Rect(0, 0, 0, 0),
      selector: 'rectilinear',
      locked: false,
    },
  };
}

export function createStageOpts(): StageOpts {
  return {
    enabled: true,
    panZoom: true,
    background: '#eee',
    autoPersist: true,
  };
}

export interface PersistedStage {
  key: string;
  opts: StageOpts;
  extra: StageExtra;
  selection: StageSelectionJson;
}

export function createPersist(stageKey: string): PersistedStage {
  return {
    key: stageKey,
    opts: createStageOpts(),
    extra: {
      initCameraPos: [...initCameraPosArray],
    },
    selection: {
      polygons: [],
      selector: 'rectilinear',
      locked: false,
      cursor: { x: 0, y: 0 },
      rect: { x: 0, y: 0, width: 0, height: 0 },
    },
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
  /** Normalized device coords in [-1, 1] * [-1, 1] */
  ndCoords: Geom.VectorJson;
} & (
  | { key: 'pointerdown' }
  | { key: 'pointerup' }
  | { key: 'pointerleave' }
  | { key: 'pointermove' }
);

const initCameraPosArray: Triple<number> = [0, 0, 10];
export const initCameraPos = new THREE.Vector3(...initCameraPosArray);
export const initStageBounds = new Geom.Rect(0, 0, 0, 0);
