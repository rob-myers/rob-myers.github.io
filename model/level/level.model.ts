import { Redacted } from '@model/redux.model';
import { Poly2 } from '@model/poly2.model';
import { Subscription } from 'rxjs';
import { Rect2 } from '@model/rect2.model';
import { Vector2 } from '@model/vec2.model';

type WallStyle = (
  | 'd' // central door
  | 'w' // plain wall
);
export interface GridMeta {
  n?: WallStyle;
  e?: WallStyle;
  s?: WallStyle;
  w?: WallStyle;
}

/**
 * Stored inside level web worker.
 */
export interface LevelState {
  key: string;
  tileDim: number;
  /** Key format "${x},${y}" in world coords snapped to grid */
  grid: { [key: string]: undefined | GridMeta };
  /** Union of grid rects */
  outline: Redacted<Poly2>[];
  /** Navigable polygon */
  floors: Redacted<Poly2>[];
  /** Walls induced by `gridPoly` */
  walls: Redacted<Poly2>[];
  /** Handles tile toggling */
  tileToggleSub: null | Redacted<Subscription>;
}

export function createLevelState(
  uid: string,
  tileDim: number,
): LevelState {
  return {
    key: uid,
    tileDim,
    grid: {},
    outline: [],
    floors: [],
    walls: [],
    tileToggleSub: null,
  };
}

export interface LevelUiState {
  key: string;
  zoomFactor: number;
  renderBounds: Rect2;
  cursor: Vector2;
}

export function createLevelUiState(uid: string): LevelUiState {
  return {
    key: uid,
    renderBounds: new Rect2(0, 0, 0, 0),
    zoomFactor: 1,
    cursor: new Vector2(0, 0),
  };
}