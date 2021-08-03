/** @typedef {import('react')} React */

/** @param {React.MouseEvent} e */
export function getRelativePos(e) {
  const { left, top } = e.currentTarget.getBoundingClientRect();
  return [e.clientX - left, e.clientY - top];
}

/** @type {DOMPoint} */
let svgPoint;

/** @param {MouseEvent & { currentTarget: SVGSVGElement }} e */
export function getSvgPos(e) {
  svgPoint = svgPoint || e.currentTarget.createSVGPoint();
  svgPoint.x = e.clientX;
  svgPoint.y = e.clientY;
  return svgPoint.matrixTransform(e.currentTarget.getScreenCTM()?.inverse());
}
