import { parseSVG, makeAbsolute, MoveToCommand } from 'svg-path-parser';
import { Vect } from '../geom/vect';
import { Poly } from '../geom/poly';

/** @param {WheelEvent | PointerEvent | React.WheelEvent} e */
export function isSvgEvent(e) {
	return e.target && 'ownerSVGElement' in e.target;
}

/** @type {DOMPoint} */
let svgPoint;

/**
 * @typedef SvgPtr @type {object}
 * @property {null | number} pointerId
 * @property {number} clientX
 * @property {number} clientY
 * @property {SVGSVGElement} ownerSvg
 */

/**
 * Assumes `e.currentTarget` is an SVGElement or SVGSVGElement.
 * @param {MouseEvent | import('react').MouseEvent} e
 * @returns {SvgPtr}
 */
export function projectSvgEvt(e) {
	return {
		pointerId: e instanceof PointerEvent ? e.pointerId : null,
		clientX: e.clientX,
		clientY: e.clientY,
		ownerSvg: /** @type {*} */ (e.currentTarget)?.ownerSVGElement || e.currentTarget,
	};
}

/**
 * Get SVG world position i.e. userspace.
 * @param {SvgPtr} ptr 
 * @param {SVGGraphicsElement} [targetEl] 
 */
export function getSvgPos(ptr, targetEl) {
  svgPoint = svgPoint || ptr.ownerSvg.createSVGPoint();
  svgPoint.x = ptr.clientX;
  svgPoint.y = ptr.clientY;
  return svgPoint.matrixTransform((targetEl || ptr.ownerSvg).getScreenCTM()?.inverse());
}

/**
 * Assuming we only translate and scale.
 * @param {SVGSVGElement} svg
 */
export function getSvgScale(svg) {
	return svg.getScreenCTM()?.inverse().a || 1;
}

/**
 * The pointer `ptrs[0]` must exist.
 * @param {SvgPtr[]} ptrs
 */
export function getSvgMid(ptrs) {
  svgPoint = svgPoint || ptrs[0].ownerSvg.createSVGPoint();
	svgPoint.x = svgPoint.y = 0;
	ptrs.forEach(e => { svgPoint.x += e.clientX; svgPoint.y += e.clientY; });
	svgPoint.x /= ptrs.length || 1; svgPoint.y /= ptrs.length || 1;
  return svgPoint.matrixTransform(ptrs[0].ownerSvg.getScreenCTM()?.inverse());
}

/**
 * Based on https://github.com/Phrogz/svg-path-to-polygons/blob/master/svg-path-to-polygons.js.
 * - Only supports straight lines i.e. M, L, H, V, Z.
 * - Expects a __single polygon__ with ≥ 0 holes.
 * @param {string} svgPathString
 * @returns {null | Geom.Poly}
 */
export function svgPathToPolygon(svgPathString) {
	const rings = /** @type {Vect[][]} */ ([]);
	let ring = /** @type {Vect[]} */ ([]);

	/**
	 * @param {number} x 
	 * @param {number} y 
	 */
  function add(x, y){
    ring.push(new Vect(x, y));
  }

	makeAbsolute(parseSVG(svgPathString)).forEach(cmd => {
		switch(cmd.code) {
			case 'M':
				rings.push(ring = []);
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

	const polys = rings.map(ps => new Poly(ps));
	
	if (polys.length === 0) {
		return null;
	} else if (polys.length === 1) {
		return polys[0];
	}

	// Largest polygon 1st
	polys.sort((a, b) => a.rect.area < b.rect.area ? 1 : -1);
	return new Poly(
		polys[0].outline,
		polys.slice(1).map(poly => poly.outline),
	);
}

/**
 * @param {CanvasRenderingContext2D} ctxt 
 * @param  {Geom.VectJson[]} ring 
 */
export function fillRing(ctxt, ring, fill = true) {
  if (ring.length) {
    ctxt.moveTo(ring[0].x, ring[0].y);
    ring.forEach(p => ctxt.lineTo(p.x, p.y));
    fill && ctxt.fill();
    ctxt.closePath();
  }
}

/**
 * @param {CanvasRenderingContext2D} ctxt
 * @param {Poly[]} polys
 */
export function fillPolygon(ctxt, polys) {
	for (const poly of polys) {
		ctxt.beginPath();
    fillRing(ctxt, poly.outline, false);
    for (const hole of poly.holes) {
      fillRing(ctxt, hole, false);
    }
    ctxt.fill();
  }
}

/**
 * @param {CanvasRenderingContext2D} ctxt
 * @param {Poly[]} polys
 */
export function strokePolygon(ctxt, polys) {
	for (const poly of polys) {
		ctxt.beginPath();
    fillRing(ctxt, poly.outline, false);
    for (const hole of poly.holes) {
      fillRing(ctxt, hole, false);
    }
    ctxt.stroke();
  }
}

/**
 * @param {CanvasRenderingContext2D} ctxt
 * @param {Vect} from
 * @param {Vect} to
 */
export function drawLine(ctxt, from, to) {
	ctxt.beginPath();
	ctxt.moveTo(from.x, from.y);
	ctxt.lineTo(to.x, to.y);
	ctxt.stroke();
}

/**
 * @param {CanvasRenderingContext2D} ctxt
 * @param {string} fillStyle
 * @param {string} [strokeStyle]
 * @param {number} [lineWidth]
 */
export function setStyle(ctxt, fillStyle, strokeStyle, lineWidth) {
	ctxt.fillStyle = fillStyle;
	strokeStyle && (ctxt.strokeStyle = strokeStyle);
	lineWidth !== undefined && (ctxt.lineWidth = lineWidth);
}

/**
 * @param {CanvasRenderingContext2D} ctxt 
 * @param {Nav.Zone} navZone 
 */
export function drawTriangulation(ctxt, navZone) {
	const { groups: { 0: tris }, vertices } = navZone;
	for (const { vertexIds } of tris) {
		ctxt.beginPath();
		fillRing(ctxt, vertexIds.map(i => vertices[i]), false);
		ctxt.stroke();
	}
}

/**
 * @param {string} src
 * @returns {Promise<HTMLImageElement>}
 */
export function loadImage(src) {
	return new Promise((resolve, _reject)=> {
		const img = new Image;
		img.onload = () => resolve(img);
		img.src = src;
	});
}

/**
 * _TODO_ properly.
 * @param {MouseEvent | WheelEvent} e
 */
export function getRelativePos(e) {
	const { left, top } = (/** @type {HTMLElement} */ (e.currentTarget)).getBoundingClientRect();
	return new Vect(e.clientX - left, e.clientY - top);
}

/**
 * https://stackoverflow.com/a/4819886/2917822
 * If Chrome devtool initially open as mobile device,
 * `'ontouchstart' in window` continues to be true if switch to desktop.
 */
export function canTouchDevice() {
  return (
    typeof window !== 'undefined' && (
    'ontouchstart' in window
    || navigator.maxTouchPoints > 0
    || /** @type {*} */ (navigator).msMaxTouchPoints > 0
  ));
}
