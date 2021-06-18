import { Subject } from "rxjs";
import * as THREE from "three";
import { Triple } from "model/generic.model";
import { Controls } from "model/3d/controls";
import { createPlaceholderScene, ThreeJson } from "model/3d/three.model";

export type StageMeta = {
  key: string;
  /** Key-value store for internal use */
  extra: StageExtra;
  /** Important options for the CLI */
  opt: StageOpts;
  /** Camera controls */
  ctrl: Controls;
  /** The current scene */
  scene: THREE.Scene;
};

/** Camera and controls for viewing a stage */
export interface StageView {
  key: string;
  stageKey: string;
  camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  /** Camera controls */
  ctrl: Controls;
}

export interface StageMetaJson {
  key: string;
  opt: StageOpts;
  extra: StageExtraJson;
}

/** Key-value storage for internal use */
export interface StageExtra {
  /** Stage image data url */
  canvasPreview?: string;
  /** Camera restored from `cameraJson` */
  sceneCamera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
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
  const scene = createPlaceholderScene();
  const sceneCamera = new THREE.PerspectiveCamera;
  const controls = initializeControls(new Controls(sceneCamera));
  return {
    key: stageKey,
    extra: {
      canvasPreview: undefined,
      sceneCamera,
      keyEvent: new Subject,
      ptrEvent: new Subject,
    },
    opt: createStageOpts(),
    scene,
    ctrl: controls,
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
