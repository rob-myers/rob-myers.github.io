import { parseSVG, makeAbsolute, MoveToCommand } from 'svg-path-parser';
import { VectJson } from '../geom/types';

/**
 * Based on https://github.com/Phrogz/svg-path-to-polygons/blob/master/svg-path-to-polygons.js
 * Only supports straight lines i.e. M, L, H, V, Z
 * @param {string} svgPathString 
 */
export function svgPathToPolygons(svgPathString) {
	const polys = /** @type {VectJson[][]} */ ([]);
	let poly = /** @type {VectJson[]} */ ([]);

	/**
	 * @param {number} x 
	 * @param {number} y 
	 */
  function add(x, y){
    poly.push({ x, y });
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
	return polys;
}
