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
