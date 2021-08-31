import { parseSVG, makeAbsolute, MoveToCommand } from 'svg-path-parser';
import { Vect } from '../geom/vect';
import { Poly } from '../geom/poly';

/** @type {DOMPoint} */
let svgPoint;

/**
 * @param {MouseEvent | import('react').MouseEvent} e 
 */
export function getSvgPos(e) {
  svgPoint = svgPoint || getSvgOwner(e)?.createSVGPoint();
  svgPoint.x = e.clientX;
  svgPoint.y = e.clientY;
  return svgPoint.matrixTransform(getSvgOwner(e)?.getScreenCTM()?.inverse());
}

/**
 * @param {MouseEvent[] | import('react').MouseEvent[]} es The event `es[0]` must exist
 */
export function getSvgMid(es) {
  svgPoint = svgPoint || getSvgOwner(es[0])?.createSVGPoint();
	svgPoint.x = svgPoint.y = 0;
	es.forEach(e => { svgPoint.x += e.clientX; svgPoint.y += e.clientY; });
	svgPoint.x /= es.length || 1; svgPoint.y /= es.length || 1;
  return svgPoint.matrixTransform(getSvgOwner(es[0])?.getScreenCTM()?.inverse());
}

/** @param {MouseEvent | import('react').MouseEvent} e */
function getSvgOwner(e) {
	return (/** @type {null | SVGElement} */ (e.target))?.ownerSVGElement;
}

/**
 * Based on https://github.com/Phrogz/svg-path-to-polygons/blob/master/svg-path-to-polygons.js
 * Only supports straight lines i.e. M, L, H, V, Z.
 * Creates a list of polygons without holes.
 * @param {string} svgPathString 
 */
export function svgPathToPolygons(svgPathString) {
	const polys = /** @type {Vect[][]} */ ([]);
	let poly = /** @type {Vect[]} */ ([]);

	/**
	 * @param {number} x 
	 * @param {number} y 
	 */
  function add(x, y){
    poly.push(new Vect(x, y));
  }

	makeAbsolute(parseSVG(svgPathString)).forEach(cmd => {
		switch(cmd.code) {
			case 'M':
				polys.push(poly = []);
			// eslint-disable-next-line no-fallthrough
			case 'L':
			case 'H':
			case 'V':
			case 'Z':
				add(/** @type {MoveToCommand} */ (cmd).x || 0, /** @type {MoveToCommand} */ (cmd).y || 0);
			break;
			default:
				throw Error(`svg command ${cmd.command} is not supported`);
		}
	});

	return polys.map(ps => new Poly(ps));
}

/** https://stackoverflow.com/a/4819886/2917822 */
export let canTouchDevice = (
	typeof window !== 'undefined' && (
		'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
		navigator.msMaxTouchPoints > 0
	)
);
