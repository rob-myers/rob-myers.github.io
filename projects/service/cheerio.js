import { CheerioAPI, Element } from 'cheerio';
import { svgPathToPolygon } from './dom';
import { Poly, Rect, Mat } from '../geom';

/**
 * - Test if node has child <title>{title}</title>,
 * - Additionally add class {title} if so.
 * @param {CheerioAPI} api 
 * @param {Element} node 
 * @param {string} title 
 */
export function hasTitle(api, node, title) {
  return api(node).children('title').text() === title && api(node).addClass(title)
}

/**
 * Test if node has child <title>{nodeTitle}</title> matching regex
 * @param {CheerioAPI} api 
 * @param {Element} node 
 * @param {RegExp} regex 
 */
export function matchesTitle(api, node, regex) {
  return regex.test(api(node).children('title').text());
}

/**
 * @param {CheerioAPI} api
 * @param {Element[]} topNodes
 * @param {string} title
 * @param {number} [precisionDp]
 */
export function extractGeomsAt(api, topNodes, title, precisionDp) {
  const group = topNodes.find(x => hasTitle(api, x, title));
  return group ? extractGeoms(api, group, precisionDp) : [];
}

/**
 * @param {CheerioAPI} api
 * @param {Element} parent
 * @param {number} [precisionDp]
 */
export function extractGeoms(api, parent, precisionDp = 4) {
  const children = api(parent).children('rect, path, ellipse').toArray();
  return children.flatMap(x => extractGeom(api, x)).map(x => x.precision(precisionDp));
}

/**
 * @param {CheerioAPI} api
 * @param {Element} el
 */
export function extractGeom(api, el) {
  const { tagName, attribs: a } = el;
  const output = /** @type {(Geom.Poly & { _ownTags: string[] })[]} */ ([]);
  const title = api(el).children('title').text() || null;
  const _ownTags = title ? title.split(' ') : [];

  if (tagName === 'rect') {
    const poly = Poly.fromRect(new Rect(Number(a.x || 0), Number(a.y || 0), Number(a.width || 0), Number(a.height || 0)))
    output.push(Object.assign(poly, { _ownTags }));
  } else if (tagName === 'path') {
    // Must be a single connected polygon with ≥ 0 holes
    const poly = svgPathToPolygon(a.d);
    poly && output.push(Object.assign(poly, { _ownTags }));
  } else if (tagName === 'ellipse') {
    // Reinterpret ellipse as bounding rectangle (technically preserves info)
    const poly = Poly.fromRect(new Rect((Number(a.cx) - Number(a.rx)) || 0, (Number(a.cy) - Number(a.ry)) || 0, 2 * Number(a.rx) || 0, 2 * Number(a.ry) || 0))
    // Store extra tags for easy extraction
    // _ownTags.push(`ellipse-${a.cx}-${a.cy}-${a.rx}-${a.ry}`, a.transform);
    output.push(Object.assign(poly, { _ownTags }));
  } else {
    console.warn('extractGeom: unexpected tagName:', tagName, a);
  }
  // DOMMatrix not available server-side
  // const m = new DOMMatrix(a.transform);
  const m = new Mat(a.transform);
  return output.map(poly => poly.applyMatrix(m));
}
