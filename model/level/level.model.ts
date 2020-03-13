import { Redacted } from '@model/redux.model';
import { Poly2 } from '@model/poly2.model';
import { Subscription } from 'rxjs';
import { Rect2 } from '@model/rect2.model';
import { Vector2 } from '@model/vec2.model';

export const wallDepth = 2;
export const floorInset = 10;

/**
 * Stored inside level web worker.
 */
export interface LevelState {
  key: string;
  tileDim: number;
  /** Floor induced by tiles */
  tileFloors: Redacted<Poly2>[];
  /** Obstacles induced by subtiles and walls */
  tileObstacles: Redacted<Poly2>[];
  /** Navigable polygon induced by tileFloors and tileObstacles */
  floors: Redacted<Poly2>[];
  /** Walls induced by tileFloors and tileObstacles */
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
    tileFloors: [],
    tileObstacles: [],
    floors: [],
    walls: [],
    tileToggleSub: null,
  };
}

export interface LevelUiState {
  key: string;
  zoomFactor: number;
  renderBounds: Rect2;
  mouseWorld: Vector2;
  cursor: Vector2;
  cursorType: 'default' | 'refined';
  cursorHighlight: Partial<Record<'n' | 'e' | 's' | 'w', boolean>>;
}

export function createLevelUiState(uid: string): LevelUiState {
  return {
    key: uid,
    renderBounds: Rect2.zero,
    zoomFactor: 1,
    mouseWorld:  Vector2.zero,
    cursor: Vector2.zero,
    cursorType: 'default',
    cursorHighlight: {},
  };
}