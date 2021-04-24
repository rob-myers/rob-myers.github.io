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
}

export interface StageSelection {
  /**
   * The group containing a visual representation of `polygons`.
   * We may also attach semi-transparent meshes here.
   * Its initial value is only used to transmit any existing transform.
   */
  group: THREE.Group;
  /** Untransformed polygons */
  localPolys: Geom.Polygon[];
  /** Previous untransformed polygons */
  prevPolys: Geom.Polygon[];
  /** Is the selection enabled? */
  enabled: boolean;
  /** Add next rectangle to selection, or overwrite? */
  additive: boolean;
  /** Is the selection locked? */
  locked: boolean;
}

/** Serializable `StageSelection` */
interface StageSelectionJson {
  polygons: Geom.PolygonJson[];
  locked: boolean;
  enabled: boolean;
  additive: boolean;
  /** Representation of `selection.group.matrix` */
  matrix: number[];
}

export function createStage(stageKey: string): StageMeta {
  return {
    key: stageKey,
    internal: {
      keyEvents: new Subject,
      bounds: initStageBounds.clone(),
      cursorGroup: new THREE.Group,
      // ...Other stuff is attached by components
    },
    extra: {
      initCameraPos: [...initCameraPosArray],
      initCursorPos: [...initCursorPos],
      // ...Other stuff is attached by components
    },
    opts: createStageOpts(),
    sel: {
      group: new THREE.Group,
      localPolys: [],
      prevPolys: [],
      locked: false,
      enabled: true,
      additive: false,
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
      initCursorPos: [...initCursorPos],
    },
    selection: {
      polygons: [],
      locked: false,
      enabled: true,
      additive: false,
      matrix: identityMatrix4.toArray(),
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
export const initCursorPos: Triple<number> = [0, 0, 0];
export const initStageBounds = new Geom.Rect(0, 0, 0, 0);
