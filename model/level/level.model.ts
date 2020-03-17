import { Redacted } from '@model/redux.model';
import { Poly2 } from '@model/poly2.model';
import { Subscription, Subject } from 'rxjs';
import { Rect2 } from '@model/rect2.model';
import { Vector2, Vector2Json } from '@model/vec2.model';
import { KeyedLookup } from '@model/generic.model';
import { LevelMetaUi, LevelMeta } from './level-meta.model';

export const wallDepth = 2;
export const floorInset = 5;
export const tileDim = 60;
/** `tileDim` divided by 3 */
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
  wallSeg: Record<string, [Vector2Json, Vector2Json]>;
  /** Navigable polygon induced by tileFloors and walls */
  floors: Redacted<Poly2>[];
  /** Tile/wall toggle handler */
  tileToggleSub: null | Redacted<Subscription>;
  /** Meta update handler */
  metaUpdateSub: null | Redacted<Subscription>;
  /** Spawn points, steiner points, lights, interactives */
  metas: KeyedLookup<LevelMeta>;
}

export function createLevelState(uid: string): LevelState {
  return {
    key: uid,
    tileFloors: [],
    wallSeg: {},
    floors: [],
    tileToggleSub: null,
    metaUpdateSub: null,
    metas: {},
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
  /** UIs for LevelState.metas */
  metaUi: KeyedLookup<LevelMetaUi>;
  /** Key of dragged meta if any */
  draggedMeta: null | string;
  wheelForwarder: null | Redacted<Subject<ForwardedWheelEvent>>;
}

export type ForwardedWheelEvent = {
  key: 'wheel';
  e: React.WheelEvent;
};

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
    metaUi: {},
    draggedMeta: null,
    wheelForwarder: null,
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
