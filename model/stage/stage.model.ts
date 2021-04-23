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
   * The transformation group of the Selection component.
   * We will attach semi-transparent meshes here.
   */
  group?: THREE.Group;
  /** Currently selected polygons */
  polygons: Geom.Polygon[];
  /** Previously selected polygons */
  prevPolys: Geom.Polygon[];
  /** Is the selection locked? */
  locked: boolean;
  /** Is the selection enabled? */
  enabled: boolean;
  /** Add next rectangle to selection, or overwrite? */
  additive: boolean;
  /** Last cursor position */
  cursor: Geom.Vector;
  /**
   * TODO add transform matrix
   */
}

interface StageSelectionJson {
  polygons: Geom.PolygonJson[];
  locked: boolean;
  enabled: boolean;
  additive: boolean;
  cursor: Geom.VectorJson;
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
      prevPolys: [],
      locked: false,
      enabled: true,
      additive: false,
      cursor: new Geom.Vector,
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
      locked: false,
      enabled: true,
      additive: false,
      cursor: { x: 0, y: 0 },
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
export const initStageBounds = new Geom.Rect(0, 0, 0, 0);
