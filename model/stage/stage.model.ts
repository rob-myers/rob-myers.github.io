import { Subject } from "rxjs";
import * as THREE from "three";
import { Triple } from "model/generic.model";
import * as Geom from "model/geom";
import { Controls } from "model/3d/controls";
import { ThreeJson } from "model/3d/three.model";

export type StageMeta = {
  key: string;
  /** Key-value store for internal use */
  extra: StageExtra;
  /** Important options for the CLI */
  opt: StageOpts;
  /** Attached by `Stage` */
  ctrl?: Controls;
  /** The current scene (running or background) */
  scene: THREE.Scene;
};

export interface StageMetaJson {
  key: string;
  opt: StageOpts;
  extra: Omit<StageExtra, (
    | 'keyEvent'
    | 'ptrEvent'
    | 'bgScene'
    | 'sceneGroup'
  )>;
}

/** Key-value storage for internal use */
export interface StageExtra {
  /** Data url */
  canvasPreview?: string;
  /** Initial camera position */
  initCamPos: Triple<number>;
  initCamTarget: Triple<number>;
  initCamZoom: number;

  /** Serialized scene */
  sceneJson?: ThreeJson;
  /**
   * The 2nd child of the restored scene.
   * NOTE 1st child consists of helpers. 
   */
  sceneGroup: THREE.Group;
  /**
   * Used to rehydrate live scene.
   * Provided to CLI when stage is disabled.
   * NOTE objects can only be in one scene at a time.
   */
  bgScene: THREE.Scene;

  /** Keyboard events sent by `Stage` */
  keyEvent: Subject<StageKeyEvent>;
  /** Mouse eventzs sent by `Stage` */
  ptrEvent: Subject<StagePointerEvent>;
}

/** Keep this flat so stage.proxy handles updates */
export interface StageOpts {
  /** Is the stage enabled? */
  enabled: boolean;
  /** Should stage capture mousewheel as pan/zoom? */
  panZoom: boolean;
}

export function createStage(stageKey: string): StageMeta {
  const bgScene = new THREE.Scene;
  return {
    key: stageKey,
    extra: {
      initCamPos: [...initCameraPosArray],
      initCamTarget: [0, 0, 0],
      initCamZoom: initCameraZoom,
      keyEvent: new Subject,
      ptrEvent: new Subject,
      sceneGroup: new THREE.Group,
      bgScene,
    },
    opt: createStageOpts(),
    scene: bgScene,
  };
}

export function createStageOpts(): StageOpts {
  return {
    enabled: false,
    panZoom: true,
  };
}

export const stageOptKeys = Object.keys(createStageOpts());

export function createPersist(stageKey: string): StageMetaJson {
  return {
    key: stageKey,
    opt: createStageOpts(),
    extra: {
      initCamPos: [...initCameraPosArray],
      initCamTarget: [0, 0, 0],
      initCamZoom: initCameraZoom,
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
export const initCameraZoom = 10;
export const initStageBounds = new Geom.Rect(0, 0, 0, 0);

export const stageNavInset = 0.045;
