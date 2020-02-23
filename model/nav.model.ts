import { Rect2 } from '@model/rect2.model';
import { Redacted, redact } from '@store/redux.model';
import { Poly2 } from '@model/poly2.model';
import { NavGraph } from './nav-graph.model';

export function getNavElemId(data: (
  | { key: 'content'; domUid: string }
  | { key: 'svg-background'; domUid: string }
  | { key: 'svg-foreground'; domUid: string }
  | { key: 'spawn'; uid: string; domUid: string }
)) {
  switch (data.key) {
    case 'content': return `nav-${data.domUid}`;
    case 'svg-background': return `nav-bg-${data.domUid}`;
    case 'svg-foreground': return `nav-fg-${data.domUid}`;
    case 'spawn': return `nav-spawn-${data.domUid}_${data.uid}`;
  }
}

export const defaultNavOutset = 10;

export function createNavDomState(uid: string): NavDomState {
  return {
    key: uid,
    elemId: getNavElemId({ key: 'content', domUid: uid }),
    navOutset: defaultNavOutset,
    spawns: [],
    screenBounds: Rect2.from(),
    worldBounds: Rect2.from(),
    navigable: [],
    refinedNav: [],
    navGraph: redact(NavGraph.from([])),
    updating: false,
  };
}

export function createNavSpawnState(
  uid: string,
  domUid: string,
  worldBounds: Rect2,
): NavSpawnState {
  return {
    key: uid,
    parentKey: domUid,
    elemId: getNavElemId({ key: 'spawn', uid, domUid }),
    bounds: worldBounds,
  };
}

export interface NavDomState {
  /** uid. */
  key: string;
  elemId: string;
  /** Optional custom outset; overrides default. */
  navOutset?: number;
  /** Optional custom class name for holes. */
  navHoleClass?: string;
  /** Registered spawn points. */
  spawns: NavSpawnState[];
  worldBounds: Rect2;
  screenBounds: Rect2;
  /** Navigable multipolygon. */
  navigable: Redacted<Poly2>[];
  /** Refined multipolygon for pathfinding. */
  refinedNav: Redacted<Poly2>[];
  navGraph: Redacted<NavGraph>;
  updating: boolean;
}

export interface NavSpawnState {
  key: string;
  parentKey: string;
  elemId: string;
  bounds: Rect2;
}

export interface NavDomMeta {
  key: string;
  justHmr: boolean;
  pendingUpdate: boolean;
  debug: boolean;
}

export function createNavDomMetaState(uid: string): NavDomMeta {
  return {
    key: uid,
    justHmr: false,
    pendingUpdate: false,
    debug: false,
  };
}
