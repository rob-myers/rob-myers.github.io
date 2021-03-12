import { Vector3 } from "three";

export const initCameraPos = new Vector3(0, 0, 10);

export type StageMsg = (
  { key: 'select-n-gon'; n: number }
);
