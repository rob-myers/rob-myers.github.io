import { Vector2 } from './geom/vec2.model';

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

export function getRelativePos(e: React.MouseEvent, forwardedTo?: Element): Vector2 {
  const { left, top } = e.currentTarget.getBoundingClientRect();
  const relPos = new Vector2(e.clientX - left, e.clientY - top);
  
  if (forwardedTo && (forwardedTo !== e.currentTarget)) {
    relPos // Adjust to receiver coords
      .add(e.currentTarget.getBoundingClientRect())
      .sub(forwardedTo.getBoundingClientRect());
  }
  return relPos;
}

export function getWindow<T extends Record<string, any>>(): (Window & T) | undefined {
  return typeof window === 'undefined'
    ? undefined
    : window as unknown as (Window & T);
}
