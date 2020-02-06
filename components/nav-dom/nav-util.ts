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
