import { Redacted } from '@model/redux.model';
import { Poly2 } from '@model/poly2.model';
import { Subscription } from 'rxjs';
import { Rect2 } from '@model/rect2.model';
import { Vector2, Vector2Json } from '@model/vec2.model';

export const wallDepth = 2;
export const floorInset = 10;

type SubTileKey = 'c' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';
/** Start, middle, or end */
type WallSegKey = 's' | 'm' | 'e';

/**
 * Alternatively could represent via level {floor} polygon,
 * level {obstacle} polygon, and:
 * - tile-click inverts floor polygon (restricted to tile)
 * - subtile-click needs to test for subtile in {floor} or {obstacle}
 *   and move between them
 * - wall-click inverts obstacle polygon (restricted to wall)
 */
export interface TileMeta {
  /** Fully filled floor? */
  f: boolean;
  /** Sub floor tiles (relevant if floor not fully filled) */
  sf?: { [key in SubTileKey]?: boolean; };
  /** Blocks i.e. obstacles */
  b?: { [key in SubTileKey]?: boolean; };
  /** Walls */
  w?: {
    n?: { [key in WallSegKey]?: boolean };
    e?: { [key in WallSegKey]?: boolean };
    s?: { [key in WallSegKey]?: boolean };
    w?: { [key in WallSegKey]?: boolean };
  };
}

/**
 * Stored inside level web worker.
 */
export interface LevelState {
  key: string;
  tileDim: number;
  /** Key format "${x},${y}" in world coords snapped to grid */
  grid: { [key: string]: undefined | TileMeta };
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

export function toggleGrid(grid: LevelState['grid'], worldPoint: Vector2Json) {
  const key = `${worldPoint.x},${worldPoint.y}`;
  const action: 'remove' | 'add' = grid[key]?.f ? 'remove' : 'add';
  return {
    nextGrid: { ...grid, [key]: { ...grid[key], f: action === 'add' } },
    action,
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