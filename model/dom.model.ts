export function getWindow<T extends Record<string, any>>(): (Window & T) | undefined {
  return typeof window === 'undefined'
    ? undefined
    : window as unknown as (Window & T);
}

/**
 * Target element must have a bounding rect, so `window` is not supported.
 */
export function getRelativePos(e: React.MouseEvent | MouseEvent): { x: number; y: number } {
  const { left, top } = (e.currentTarget! as Element).getBoundingClientRect();
  return { x: e.clientX - left, y: e.clientY - top };
}

export function traverseDom(el: Element, act: (el: Element) => void) {
  act(el);
  for (const childEl of el.children) {
    traverseDom(childEl as Element, act);
  }
}
