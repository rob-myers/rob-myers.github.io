import { Vector, Rect } from "@model/geom/geom.model";

export interface EnvState {
  /** Identifier e.g. `level-1` */
  key: string;
  /** Mouse position in world coords */
  mouseWorld: Vector;
  /** Viewport bounds in world coords. */
  renderBounds: Rect;
  /** Zoom multiplier with default `1` */
  zoom: number;
}

export function createEnvState(envKey: string): EnvState {
  return {
    key: envKey,
    mouseWorld:  Vector.zero,
    renderBounds: Rect.zero,
    zoom: 1,
  };
}

export const tileDim = 10;
