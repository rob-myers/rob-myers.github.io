import { Rect2 } from '@custom-types/rect2.model';
import { redact, Redacted } from '@store/redux.model';
import { Poly2 } from '@custom-types/poly2.model';

type NavElKey = 'root' | 'nav-poly' | 'spawn';

export function getNavElemId(uid: string, key: NavElKey) {
  switch (key) {
    case 'root': return `nav-root-${uid}`;
    case 'nav-poly': return `nav-poly-${uid}`;
    case 'spawn': return `nav-spawn-${uid}`;
  }
}

export function traverseDom(el: Element, act: (el: Element) => void) {
  act(el);
  Array.from(el.children).forEach((childEl) => traverseDom(childEl, act));
}

export const navOutset = 10;

export function createNavDomState(uid: string): NavDomState {
  return {
    key: uid,
    elemId: getNavElemId(uid, 'root'),
    nextUpdate: null,
    spawns: [],
    bounds: redact(Rect2.from()),
    navPolys: [],
  };
}

export interface NavDomState {
  /** uid. */
  key: string;
  elemId: string;
  /** For throttling (epoch ms). */
  nextUpdate: null | number;
  spawns: NavSpawnState[];
  bounds: Redacted<Rect2>;
  navPolys: Redacted<Poly2>[];
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