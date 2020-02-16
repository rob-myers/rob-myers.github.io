import { Rect2 } from '@model/rect2.model';
import { redact, Redacted } from '@store/redux.model';
import { Poly2 } from '@model/poly2.model';

type NavElKey = 'content' | 'nav-poly' | 'spawn';

export function getNavElemId(uid: string, key: NavElKey) {
  switch (key) {
    case 'content': return `nav-root-${uid}`;
    case 'nav-poly': return `nav-poly-${uid}`;
    case 'spawn': return `nav-spawn-${uid}`;
  }
}

export function traverseDom(el: Element, act: (el: Element) => void) {
  act(el);
  for (const childEl of el.children) {
    traverseDom(childEl, act);
  }
}

export const observeOpts: MutationObserverInit = {
  attributes: true,
  childList: true,
  subtree: true,
};

export const navOutset = 10;

export function createNavDomState(uid: string): NavDomState {
  return {
    key: uid,
    elemId: getNavElemId(uid, 'content'),
    spawns: [],
    worldBounds: redact(Rect2.from()),
    navigable: [],
    refinedNav: [],
  };
}

export interface NavDomState {
  /** uid. */
  key: string;
  elemId: string;
  spawns: NavSpawnState[];
  worldBounds: Redacted<Rect2>;
  /** Navigable multipolygon. */
  navigable: Redacted<Poly2>[];
  /** Refined multipolygon for pathfinding. */
  refinedNav: Redacted<Poly2>[];
}

interface NavSpawnState {
  key: string;
  elemId: string;
  bounds: Redacted<Rect2>;
}

/** Descendant leaf elem. */
interface NavLeafRect {
  key: string;
  elemId: string;
  bounds: Redacted<Rect2>;
}

/** Descendant poly. */
interface NavPoly {
  key: string;
  elemId: string;
  bounds: Redacted<Rect2>;
}

export interface NavDomMeta {
  key: string;
  justHmr: boolean;
  updating: boolean;
}

export function createNavDomMetaState(uid: string): NavDomMeta {
  return {
    key: uid,
    justHmr: false,
    updating: false,
  };
}
