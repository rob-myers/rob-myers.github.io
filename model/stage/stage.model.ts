import { Subject } from "rxjs";
import * as THREE from "three";
import { Triple } from "model/generic.model";
import { Controls } from "model/3d/controls";
import { createPlaceholderGroup, ThreeJson } from "model/3d/three.model";

export type StageMeta = {
  key: string;
  /** Key-value store for internal use */
  extra: StageExtra;
  /** Important options for the CLI */
  opt: StageOpts;
  /** Camera controls */
  ctrl: Controls;
  /** The current scene (running or background) */
  scene: THREE.Scene;
};

export interface StageMetaJson {
  key: string;
  opt: StageOpts;
  extra: StageExtraJson;
}

/** Key-value storage for internal use */
export interface StageExtra {
  /** Stage image data url */
  canvasPreview?: string;
  /**
   * Second child of scene restored from `sceneJson`.
   * The 1st child consists of helpers. 
   */
  sceneGroup: THREE.Group;
  /** Camera restored from `cameraJson` */
  sceneCamera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  /**
   * Used to rehydrate scene and by CLI when stage disabled.
   * NOTE objects can only be in one scene at a time.
   */
  bgScene: THREE.Scene;
  /** Keyboard events sent by `Stage` */
  keyEvent: Subject<StageKeyEvent>;
  /** Mouse events sent by `Stage` */
  ptrEvent: Subject<StagePointerEvent>;
}

export interface StageExtraJson {
  /** Stage image data url */
  canvasPreview?: string;
  /** Camera's target */
  camTarget: Triple<number>;
  /** Serialized camera */
  cameraJson: ThreeJson;
  /** Serialized scene */
  sceneJson: ThreeJson;
}

/** Keep this flat so stage.proxy handles updates */
export interface StageOpts {
  /** Is the stage enabled? */
  enabled: boolean;
  /** Should stage capture mousewheel as pan/zoom? */
  panZoom: boolean;
  /** Should we persist this stage? */
  persist: boolean;
}

export function createStage(stageKey: string): StageMeta {
  const bgScene = new THREE.Scene;
  const sceneCamera = new THREE.PerspectiveCamera;
  return {
    key: stageKey,
    extra: {
      canvasPreview: undefined,
      sceneGroup: createPlaceholderGroup(),
      sceneCamera,
      bgScene,
      keyEvent: new Subject,
      ptrEvent: new Subject,
    },
    opt: createStageOpts(),
    scene: bgScene,
    ctrl: initializeControls(new Controls(sceneCamera)),
  };
}

export function createStageOpts(): StageOpts {
  return {
    enabled: false,
    panZoom: true,
    persist: true,
  };
}

export const stageOptKeys = Object.keys(createStageOpts());

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

export const initCameraTarget = new THREE.Vector3(0, 0, 0);
export const stageNavInset = 0.045;

export function initializeControls(ctrl: Controls) {
  ctrl.maxPolarAngle = Math.PI / 4;
  ctrl.screenSpacePanning = false;
  ctrl.enableDamping = true;

  if (ctrl.camera.type === 'OrthographicCamera') {
    ctrl.camera.zoom = 10;
    ctrl.camera.near = ctrl.camera.position.z - 1000;
    [ctrl.minZoom, ctrl.maxZoom] = [5, 60];
  } else {
    [ctrl.minDistance, ctrl.maxDistance] = [5, 80];
    ctrl.camera.near = 1;
  }

  ctrl.target.set(0, 0, 0);
  return ctrl;
}
