import { Vector, Rect, VectorJson } from "@model/geom/geom.model";

export interface EnvState {
  /** Identifier e.g. `level-1` */
  key: string;
  dimension: Vector;
  /** Mouse position in world coords */
  mouseWorld: Vector;
  /** Viewport bounds in world coords. */
  renderBounds: Rect;
  /** Zoom multiplier with default `1` */
  zoom: number;
}

export function createEnvState(envKey: string, dimension: VectorJson): EnvState {
  return {
    key: envKey,
    dimension: Vector.from(dimension),
    mouseWorld:  Vector.zero,
    renderBounds: new Rect(0, 0, dimension.x, dimension.y),
    zoom: 1,
  };
}

export const tileDim = 10;
