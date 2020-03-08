import { Redacted } from '@model/redux.model';
import { Poly2 } from '@model/poly2.model';
import { Subscription } from 'rxjs';

/**
 * Stored inside level web worker.
 */
export interface LevelState {
  key: string;
  tileDim: number;
  /** Key format "${x},${y}" in world coords snapped to grid */
  grid: { [key: string]: undefined | boolean };
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