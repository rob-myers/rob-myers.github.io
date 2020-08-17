import { Vector, Rect, VectorJson } from "@model/geom/geom.model";

export interface EnvState {
  /** Identifier e.g. `level-1` */
  key: string;
  /** Size of screen in pixels */
  screenDim: Vector;
  /** Mouse position in screen coords relative to svg. */
  mouseScreen: Vector;
  /** Mouse position in world coords */
  mouseWorld: Vector;
  /** Viewport bounds in world coords. */
  renderBounds: Rect;
  /** Half of `screenDim` */
  screenCenter: Vector;
  /** Zoom multiplier with default `1` */
  zoom: number;
}

export function createEnvState(
  envKey: string,
  screenDim: VectorJson,
): EnvState {
  return {
    key: envKey,
    screenDim: Vector.from(screenDim),
    mouseScreen: Vector.zero,
    mouseWorld: Vector.zero,
    renderBounds: new Rect(0, 0, screenDim.x, screenDim.y),
    screenCenter: Vector.from(screenDim).scale(0.5),
    zoom: 1,
  };
}

export const tileDim = 10;
