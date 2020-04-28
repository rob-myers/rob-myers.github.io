import { Subscription, Subject } from 'rxjs';
import { Redacted, redact } from '@model/redux.model';
import { Poly2 } from '@model/poly2.model';
import { Rect2 } from '@model/rect2.model';
import { Vector2, Vector2Json } from '@model/vec2.model';
import { KeyedLookup } from '@model/generic.model';
import { FloydWarshall } from '@model/level/nav/floyd-warshall.model';
import { NavGraph } from '@model/level/nav/nav-graph.model';
import { LevelMetaGroupUi, LevelMetaGroup } from './level-meta.model';
import { FloydWarshallReady } from './level.worker.model';
import { tileDim } from './level-params';

export type Direction = 'n' | 'e' | 's' | 'w'; 

/**
 * Stored inside level web worker.
 */
export interface LevelState {
  key: string;
  /** Floor induced by tiles, including un-navigable areas */
  tileFloors: Redacted<Poly2>[];
  /** `tileFloors` without rects specified by 'cut' metas */
  tilesSansCuts: Redacted<Poly2>[];
  /** Line segments aligned to refined grid */
  wallSeg: Record<string, [Vector2Json, Vector2Json]>;
  /** Actual wall line segments, taking door/horiz/vert metas into account */
  innerWalls: [Vector2, Vector2][];
  /** Navigable polygon induced by tileFloors, walls, inset amount and metas */
  floors: Redacted<Poly2>[];
  /** Tile/wall toggle handler */
  tileToggleSub: null | Redacted<Subscription>;
  /** Meta update handler */
  metaUpdateSub: null | Redacted<Subscription>;
  /** Spawn points, steiner points, lights, triggers, obstructions */
  metaGroups: KeyedLookup<LevelMetaGroup>;
  /** Pathfinder */
  floydWarshall: null | Redacted<FloydWarshall>;
  /** Navigation graph used to generate `floydWarshall` */
  navGraph: Redacted<NavGraph>;
}

export function createLevelState(uid: string): LevelState {
  return {
    key: uid,
    tileFloors: [],
    tilesSansCuts: [],
    wallSeg: {},
    innerWalls: [],
    floors: [],
    tileToggleSub: null,
    metaUpdateSub: null,
    metaGroups: {},
    floydWarshall: null,
    navGraph: redact(NavGraph.from([], {}, [])),
  };
}

export interface LevelUiState {
  /** Level identifier e.g. `level-1` */
  key: string;
  /** Top left of square cursor (snapped to grid) */
  cursor: Vector2;
  /** The 4 edges of the cursor can be highlighted */
  cursorHighlight: Partial<Record<Direction, boolean>>;
  /** Key of dragged meta, if any */
  draggedMeta: null | string;
  /** UIs for LevelState.metas */
  metaGroupUi: KeyedLookup<LevelMetaGroupUi>;
  /** Editing or in live mode */
  mode: 'edit' | 'live';
  /** Mouse position in world coords */
  mouseWorld: Vector2;
  /** Can forward notifications to LevelNotify */
  notifyForwarder: null | Redacted<Subject<ForwardedNotification>>;
  /** Viewport bounds in world coords. */
  renderBounds: Rect2;
  /** Show rect partition? */
  showNavRects: boolean;
  /** Show triangulation? */
  showNavTris: boolean;
  /** Show 3d walls? */
  showThreeD: boolean;
  /** CSS theme */
  theme: 'light-mode' | 'dark-mode';
  /** Can forward wheel events (pan/zoom) to LevelMouse  */
  wheelForwarder: null | Redacted<Subject<ForwardedWheelEvent>>;
  /** Zoom multiplier with default `1` */
  zoomFactor: number;
}

export interface ForwardedWheelEvent {
  key: 'wheel';
  e: React.WheelEvent;
}

export type ForwardedNotification = (
  | { key: 'floyd-warshall-ready'; orig: FloydWarshallReady }
  | { key: 'ping' }
);

export function createLevelUiState(uid: string): LevelUiState {
  return {
    key: uid,
    cursor: Vector2.zero,
    cursorHighlight: {},
    draggedMeta: null,
    metaGroupUi: {},
    mode: 'edit',
    mouseWorld:  Vector2.zero,
    notifyForwarder: null,
    renderBounds: Rect2.zero,
    showNavRects: true,
    showNavTris: false,
    showThreeD: false,
    theme: 'dark-mode',
    wheelForwarder: null,
    zoomFactor: 1,
  };
}

export function computeLineSeg(from: Vector2, dir: Direction): [Vector2, Vector2] {
  switch (dir) {
    case 'n': return [new Vector2(from.x, from.y), new Vector2(from.x + tileDim, from.y)];
    case 'e': return [new Vector2(from.x + tileDim, from.y), new Vector2(from.x + tileDim, from.y + tileDim)];
    case 's': return [new Vector2(from.x, from.y + tileDim), new Vector2(from.x + tileDim, from.y + tileDim)];
    case 'w': return [new Vector2(from.x, from.y), new Vector2(from.x, from.y + tileDim)];
  }
}
