import { CheerioAPI, Element } from 'cheerio';
import { svgPathToPolygon } from './dom';
import { Poly, Rect, Mat } from '../geom';
import { warn } from './log';

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
 * Extract rect, path, ellipse modulo <g> and <use>.
 * @param {CheerioAPI} api
 * @param {Record<string, Element[]>} symbolLookup
 * @param {Element} parentFrame A <g> containing frame's graphics.
 * @returns {ServerTypes.NpcAnimFrame}
 */
export function extractDeepMetas(api, symbolLookup, parentFrame) {
  const children = api(parentFrame).children('rect, path, ellipse, g, use').toArray();
  return {
    geoms: children.flatMap(x => extractMeta(api, x, { symbolLookup })),
    // NOTE concerning `parentFrame` transform...
    transform: new Mat(parentFrame.attribs.transform).toArray(),
  };
}

/**
 * @param {CheerioAPI} api
 * @param {Element} el
 * @param {{ symbolLookup?: Record<string, Element[]>; prependTags?: string[]; transform?: [number, number, number, number, number, number] }} [ctxt]
 * @returns {ServerTypes.GeomTagMeta | ServerTypes.GeomTagMeta[]}
 */
function extractMeta(api, el, ctxt) {
  const { tagName, attribs: a } = el;
  const title = api(el).children('title').text() || null;

  const tags = title ? title.split(' ') : [];
  ctxt?.prependTags && tags.unshift(...ctxt.prependTags);

  // NOTE DOMMatrix not available server-side
  const m = new Mat(a.transform);
  ctxt?.transform && m.preMultiply(ctxt.transform);
  m.precision(3);
  const transform = m.isIdentity ? undefined : m.toArray();

  const style = (a.style??'').split(/;\s?/).map(x => x.split(/:\s?/)).reduce((agg, [k, v]) => ({ ...agg, [k]: v }), {});

  if (tagName === 'rect') {
    return { tags, transform, style, tagName: 'rect', x: Number(a.x || 0), y: Number(a.y || 0), width: Number(a.width || 0), height: Number(a.height || 0) };
  } else if (tagName === 'path') {
    return { tags, transform, style, tagName: 'path', d: a.d };
  } else if (tagName === 'ellipse') {
    return { tags, transform, style, tagName: 'ellipse', cx: Number(a.cx || 0), cy: Number(a.cy || 0), rx: Number(a.rx || 0), ry: Number(a.ry || 0) };
  } else if (tagName === 'g') {
    // NOTE currently ignore `style` on <g>
    const children = api(el).children('rect, path, ellipse, g').toArray();
    return children.flatMap(x => extractMeta(api, x, { symbolLookup: ctxt?.symbolLookup, prependTags: tags, transform }));
  } else if (tagName === 'use') {
    const symbolId = el.attribs.href.slice('#'.length);
    if (ctxt?.symbolLookup?.[symbolId]) {
      return ctxt.symbolLookup[symbolId].flatMap(el => extractMeta(api, el, { symbolLookup: ctxt?.symbolLookup, prependTags: tags, transform }));
    } else {
      warn(`extractMeta: symbol #${symbolId} not found`);
    }
  } else {
    warn(`extractMeta: unexpected tagName: "${tagName}"`);
  }
  return [];
}
