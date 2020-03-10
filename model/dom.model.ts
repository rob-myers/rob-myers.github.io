import { Vector2 } from './vec2.model';

/** Ancestors including {el} */
export function getDomAncestors(el: Element): Element[] {
  return [
    el,
    ...(el.parentElement
      ? getDomAncestors(el.parentElement)
      : []
    )
  ];
}

export function traverseDom(el: HTMLElement, act: (el: HTMLElement) => void) {
  act(el);
  for (const childEl of el.children) {
    traverseDom(childEl as HTMLElement, act);
  }
}

export function getRelativePos(e: React.MouseEvent): Vector2 {
  const { left, top } = e.currentTarget.getBoundingClientRect();
  return new Vector2(e.clientX - left, e.clientY - top);
}
