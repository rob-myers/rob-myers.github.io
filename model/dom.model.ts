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
