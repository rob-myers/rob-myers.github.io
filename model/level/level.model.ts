import { Redacted } from '@model/redux.model';
import { Poly2 } from '@model/poly2.model';
import { Subscription } from 'rxjs';
import { Rect2 } from '@model/rect2.model';
import { Vector2, Vector2Json } from '@model/vec2.model';
import { KeyedLookup } from '@model/generic.model';
import { LevelPointUi, LevelPoint } from './level-point.model';

export const wallDepth = 2;
export const floorInset = 5;
export const tileDim = 60;
/** tileDim divided by 3 */
export const smallTileDim = 20;

export type Direction = 'n' | 'e' | 's' | 'w'; 

/**
 * Stored inside level web worker.
 */
export interface LevelState {
  key: string;
  /** Floor induced by tiles */
  tileFloors: Redacted<Poly2>[];
  /** Line segments aligned to refined grid */
  walls: Record<string, [Vector2Json, Vector2Json]>;
  /** Navigable polygon induced by tileFloors and walls */
  floors: Redacted<Poly2>[];
  /** Tile/wall toggle handler */
  tileToggleSub: null | Redacted<Subscription>;
  /** Spawn points, steiner points, lights, interactives */
  metaPoints: KeyedLookup<LevelPoint>;
}

export function createLevelState(uid: string): LevelState {
  return {
    key: uid,
    tileFloors: [],
    walls: {},
    floors: [],
    tileToggleSub: null,
    metaPoints: {},
  };
}

export interface LevelUiState {
  key: string;
  zoomFactor: number;
  renderBounds: Rect2;
  mouseWorld: Vector2;
  cursor: Vector2;
  cursorType: 'default' | 'refined';
  cursorHighlight: Partial<Record<Direction, boolean>>;
  mode: 'edit' | 'live';
  editMode: null | 'make' | 'meta';
  metaUi: KeyedLookup<LevelPointUi>;
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
    mode: 'edit',
    editMode: 'make',
    metaUi: {},
  };
}

export function createLevelPointUi(key: string): LevelPointUi {
  return {
    key,
    open: false,
    position: Vector2.zero,
  };
}

/**
 * For large tiles we create 3 line segments.
 * Part of approach to avoid extruding 1-dim polygons.
 */
export function computeLineSegs(td: number, from: Vector2, dir: Direction): [Vector2, Vector2][] {
  let seg: [Vector2, Vector2];
  switch (dir) {
    case 'n': seg = [new Vector2(from.x, from.y), new Vector2(from.x + smallTileDim, from.y)]; break;
    case 'e': seg = [new Vector2(from.x + td, from.y), new Vector2(from.x + td, from.y + smallTileDim)]; break;
    case 's': seg = [new Vector2(from.x, from.y + td), new Vector2(from.x + smallTileDim, from.y + td)]; break;
    case 'w': seg = [new Vector2(from.x, from.y), new Vector2(from.x, from.y + smallTileDim)]; break;
  }

  if (td === smallTileDim) {
    return [seg];
  }
  const d = dir === 'n' || dir === 's'
    ? new Vector2(smallTileDim, 0) : new Vector2(0, smallTileDim);
  return [seg, seg, seg].map(([u, v], i) =>
    [u.clone().translate(i * d.x, i * d.y), v.clone().translate(i * d.x, i * d.y)]);
}
