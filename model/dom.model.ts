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

