import { Rect2 } from '@model/rect2.model';
import { redact, Redacted } from '@store/redux.model';
import { Poly2 } from '@model/poly2.model';

export const createNavWorker = () =>
  redact(new Worker('@worker/example.worker.ts', { type: 'module' }));

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
  Array.from(el.children).forEach((childEl) => traverseDom(childEl, act));
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
    nextUpdate: null,
    pending: false,
    spawns: [],
    screenBounds: redact(Rect2.from()),
    worldBounds: redact(Rect2.from()),
    navigable: [],
  };
}

export interface NavDomState {
  /** uid. */
  key: string;
  elemId: string;
  /** For throttling (epoch ms). */
  nextUpdate: null | number;
  pending: boolean;
  spawns: NavSpawnState[];
  screenBounds: Redacted<Rect2>;
  worldBounds: Redacted<Rect2>;
  /** Navigable multipolygon. */
  navigable: Redacted<Poly2>[];
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
