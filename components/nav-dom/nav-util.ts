type NavElKey = 'root' | 'nav-poly';

export function getNavElemId(uid: string, key: NavElKey) {
  switch (key) {
    case 'root': return `nav-root-${uid}`;
    case 'nav-poly': return `nav-poly-${uid}`;
  }
}
