import { Subject } from "rxjs";
import * as THREE from "three";
import { Triple } from "model/generic.model";
import * as Geom from "model/geom";
import { Controls } from "model/3d/controls";

export type StageMeta = {
  key: string;
  /** Key-value store for internal use */
  extra: StageExtra;
  /** Important options for the CLI */
  opt: StageOpts;
  /** Attached on mount */
  ctrl?: Controls;
  /** Attached by Stage */
  scene?: THREE.Scene;
};

export interface StageMetaJson {
  key: string;
  opt: StageOpts;
  extra: Omit<StageExtra, 'keyEvent' | 'ptrEvent'>;
}

/** Key-value storage for internal use */
export interface StageExtra {
  /** Data url */
  canvasPreview?: string;
  /** Initial camera position */
  initCamPos: Triple<number>;
  initCamTarget: Triple<number>;
  initCamZoom: number;
  /** Keyboard events sent by `Stage` */
  keyEvent: Subject<StageKeyEvent>;
  /** Mouse events sent by `Stage` */
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
  return {
    key: stageKey,
    // {ctrl,scene} attached by components
    extra: {
      initCamPos: [...initCameraPosArray],
      initCamTarget: [0, 0, 0],
      initCamZoom: initCameraZoom,
      keyEvent: new Subject,
      ptrEvent: new Subject,
    },
    opt: createStageOpts(),
  };
}

export function createStageOpts(): StageOpts {
  return {
    enabled: true,
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
