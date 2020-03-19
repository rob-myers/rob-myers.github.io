import { Redacted } from '@model/redux.model';
import { Poly2 } from '@model/poly2.model';
import { Subscription, Subject } from 'rxjs';
import { Rect2 } from '@model/rect2.model';
import { Vector2, Vector2Json } from '@model/vec2.model';
import { KeyedLookup } from '@model/generic.model';
import { LevelMetaUi, LevelMeta } from './level-meta.model';
import { FloydWarshall } from '@model/nav/floyd-warshall.model';

/** Depth of cursor highlight */
export const wallDepth = 2;
/** How far to inset when constructing navigable poly `floors` */
export const floorInset = 5;
/** Dimension of large tile in pixels */
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
  /** Pathfinder */
  floydWarshall: null | Redacted<FloydWarshall>;
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
    floydWarshall: null,
  };
}

export interface LevelUiState {
  /** Level identifier e.g. `level-1` */
  key: string;
  /** Zoom multiplier with default `1` */
  zoomFactor: number;
  /** Viewport bounds in world coords */
  renderBounds: Rect2;
  /** Mouse position in world coords */
  mouseWorld: Vector2;
  /** Top left of square cursor (snapped to grid) */
  cursor: Vector2;
  /** Large or small square? */
  cursorType: 'default' | 'refined';
  /** The 4 edges of the cursor can be highlighted */
  cursorHighlight: Partial<Record<Direction, boolean>>;
  /** Editing or in live mode */
  mode: 'edit' | 'live';
  /** Plan mode (default) or dark mode with lights */
  view: 'plan' | 'dark';
  /** UIs for LevelState.metas */
  metaUi: KeyedLookup<LevelMetaUi>;
  /** Key of dragged meta if any */
  draggedMeta: null | string;
  /** Can forward wheel events (pan/zoom) to LevelMouse  */
  wheelForwarder: null | Redacted<Subject<ForwardedWheelEvent>>;
}

export interface ForwardedWheelEvent {
  key: 'wheel';
  e: React.WheelEvent;
}

/** Tags with side-effects */
export const specialTags = ['steiner', 'light'];
/** Tags which can affect navigation */
export const navTags = ['steiner'];

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
    view: 'plan',
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
