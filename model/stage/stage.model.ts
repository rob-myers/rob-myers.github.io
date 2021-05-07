import { Subject } from "rxjs";
import * as THREE from "three";
import { Triple } from "model/generic.model";
import * as Geom from "model/geom";
import { PanZoomControls } from "model/3d/pan-zoom-controls";
import { identityMatrix4 } from "model/3d/three.model";
import { BotController } from "model/3d/bot-controller";

export type StageMeta = {
  key: string;
  /** The internals of the stage */
  internal: StageInternal;
  /** Key-value store for internal use */
  extra: StageExtra;
  /** Important options for the CLI */
  opt: StageOpts;
  /** The current selection */
  sel: StageSelection;
  /** Polygons e.g. `wall` */
  poly: StagePolyLookup;
  /** Lights */
  light: StageLightLookup;
  /** Bots */
  bot: StageBotLookup;
  /** Nav paths */
  path: StagePathLookup;
};

export interface StageMetaJson {
  key: string;
  opt: StageOpts;
  extra: StageExtra;
  sel: StageSelectionJson;
  poly: StagePolyLookupJson;
  light: StageLightLookupJson;
  bot: StageBotLookupJson;
  path: StagePathLookupJson;
}

export interface StageInternal {
  /** Keyboard events sent by `Stage`  */
  keyEvents: Subject<StageKeyEvent>;
  /** Mouse events sent by `Stage`  */
  ptrEvents: Subject<StagePointerEvent>;
  /** Attached on mount */
  controls?: PanZoomControls;
  /** Attached by Stage */
  scene?: THREE.Scene;
  /** `Cursor` overwrites this */
  cursor: THREE.Group;
  /** Time navmesh was last computed */
  navComputedAt: number;
}

/** Key-value storage for internal use */
export interface StageExtra {
  /** Data url */
  canvasPreview?: string;
  /** Initial camera position */
  initCameraPos: Triple<number>;
  /** Initial cursor position */
  initCursorPos: Triple<number>;
}

/** Keep this flat so stage.proxy handles updates */
export interface StageOpts {
  ambientLight: number;
  /** Persist on unload window? */
  autoPersist: boolean;
  enabled: boolean;
  lockCursor: boolean; 
  /** Can we move/zoom the camera? */
  panZoom: boolean;
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

export interface StagePolyLookup {
  wall: Geom.Polygon[];
  prevWall: Geom.Polygon[];
  obs: Geom.Polygon[];
  prevObs: Geom.Polygon[];
  nav: Geom.Polygon[];
}

export interface StagePolyLookupJson {
  wall: Geom.PolygonJson[];
  obs: Geom.PolygonJson[];
}

/** Stage lights */
export interface StageLightLookup { 
  [name: string]: THREE.SpotLight;
}

export interface StageLightLookupJson {
  [name: string]: {
    name: string;
    position: Triple<number>;
  };
}

export interface StageBotLookup {
  [name: string]: StageBot;
}

export interface StageBot {
  name: string;
  group: THREE.Group;
  controller: BotController;
}

export interface StageBotLookupJson {
  [name: string]: {
    name: string;
    position: Triple<number>;
  };
}

export interface StagePathLookup {
  [name: string]: StagePath;
}

export interface StagePath {
  name: string;
  path: Geom.Vector[];
}

export interface StagePathLookupJson {
  [name: string]: StagePathJson;
}

export interface StagePathJson {
  name: string;
  path: Geom.VectorJson[];
}

export function createStage(stageKey: string): StageMeta {
  return {
    key: stageKey,
    internal: {
      keyEvents: new Subject,
      ptrEvents: new Subject,
      cursor: new THREE.Group,
      navComputedAt: 0,
      // ...Attached by components
    },
    extra: {
      initCameraPos: [...initCameraPosArray],
      initCursorPos: [...initCursorPos],
      // ...Attached by components
    },
    opt: createStageOpts(),
    sel: {
      group: new THREE.Group,
      locked: false,
      enabled: true,
      localBounds: new Geom.Rect(0, 0, 0, 0),
      localWall: [],
      localObs: [],
    },
    poly: { wall: [], prevWall: [], obs: [], prevObs: [], nav: [] },
    light: {},
    bot: {},
    path: {},
  };
}

export function createStageOpts(): StageOpts {
  return {
    enabled: true,
    panZoom: true,
    autoPersist: true,
    wallHeight: 1,
    wallOpacity: 1,
    ambientLight: 0.15,
    lockCursor: false,
  };
}

export const stageOptKeys = Object.keys(createStageOpts());

export function createPersist(stageKey: string): StageMetaJson {
  return {
    key: stageKey,
    opt: createStageOpts(),
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
    light: {},
    bot: {},
    path: {},
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

export const stageNavInset = 0.045;
