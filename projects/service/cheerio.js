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
 * @param {CheerioAPI} api
 * @param {Element[]} topNodes
 * @param {string} title
 */
export function extractGeomsAt(api, topNodes, title) {
  const group = topNodes.find(x => hasTitle(api, x, title));
  return group ? extractGeoms(api, group) : [];
}

/**
 * @param {CheerioAPI} api
 * @param {Element} parent
 */
export function extractGeoms(api, parent) {
  const children = api(parent).children('rect, path, ellipse').toArray();
  return children.flatMap(x => extractGeom(api, x)).map(x => x.precision(4));
}

/**
 * @param {CheerioAPI} api
 * @param {Element} el
 */
function extractGeom(api, el) {
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

/**
 * @param {CheerioAPI} api
 * @param {Element} parent
 * @return {ServerTypes.GeomTagMeta[]}
 */
 export function extractMetas(api, parent) {
  const children = api(parent).children('rect, path, ellipse').toArray();
  return children.flatMap(x => extractMeta(api, x)??[]);
}

/**
 * @param {CheerioAPI} api
 * @param {Element} el
 * @returns {undefined | ServerTypes.GeomTagMeta}
 */
function extractMeta(api, el) {
  const { tagName, attribs: a } = el;
  const title = api(el).children('title').text() || null;
  const tags = title ? title.split(' ') : [];
  // DOMMatrix not available server-side
  // const m = new DOMMatrix(a.transform);
  const m = new Mat(a.transform);
  const transform = a.transform
    ? /** @type {[number, number, number, number, number, number]} */ ([m.a, m.b, m.c, m.d, m.e, m.f])
    : undefined;

  const style = (a.style??'').split(/;\s?/).map(x => x.split(/:\s?/)).reduce((agg, [k, v]) => ({ ...agg, [k]: v }), {});

  if (tagName === 'rect') {
    return { tags, transform, style, tagName: 'rect', x: Number(a.x || 0), y: Number(a.y || 0), width: Number(a.width || 0), height: Number(a.height || 0) };
  } else if (tagName === 'path') {
    return { tags, transform, style, tagName: 'path', d: a.d };
  } else if (tagName === 'ellipse') {
    return { tags, transform, style, tagName: 'ellipse', cx: Number(a.cx || 0), cy: Number(a.cy || 0), rx: Number(a.rx || 0), ry: Number(a.ry || 0) };
  } else {
    console.warn('extractMeta: unexpected tagName:', tagName, a);
  }
}
