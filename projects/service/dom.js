/** @typedef {import('react')} React */

/** @param {React.MouseEvent} e */
export function getRelativePos(e) {
  const { left, top } = e.currentTarget.getBoundingClientRect();
  return [e.clientX - left, e.clientY - top];
}

/** @type {DOMPoint} */
let svgPoint;
/** @type {SVGSVGElement} */
let svg;

/** @param {MouseEvent & { currentTarget: any }} e */
export function getSvgPos(e) {
  svg = e.currentTarget;
  svgPoint = svgPoint || svg.createSVGPoint();
  svgPoint.x = e.clientX;
  svgPoint.y = e.clientY;
  return svgPoint.matrixTransform(svg.getScreenCTM()?.inverse());
}
