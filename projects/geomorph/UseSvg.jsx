import { useQuery } from 'react-query';
import cheerio, { Cheerio, CheerioAPI, Element } from 'cheerio';
import { svgPathToPolygons } from '../service';
import { Poly, Rect } from '../geom';

/** @param {{ url: string, transform?: string }} props */
export default function UseSvg(props) {
  const { data } = useSvgText(props.url, props.transform);
  return (
    <g className={`used ${props.url.slice('/svg/'.length)}`}>
      <g
        className="loaded"
        transform={props.transform}
        dangerouslySetInnerHTML={{
          __html: data?.svgInnerText || '',
        }}
      />
      {data && (
        <g className="meta">
          {data.hull?.outline && (
            <polygon fill="rgba(100, 0, 0, 0.2)" points={`${data.hull.outline}`} />
          )}
          {data.doors.map(({ outline }, i) =>
            <polygon fill="rgba(0, 0, 200, 0.3)" key={i} points={`${outline}`} />
          )}
          {data.walls.map((poly, i) =>
            <path fill="rgba(0, 200, 0, 0.5)" key={i} d={`${poly.svgPath}`} />
          )}
        </g>
      )}
    </g>
  );
}

/**
 * @param {string} url 
 * @param {string} [transform]
 */
function useSvgText(url, transform) {
  return useQuery(
    `use-svg-${url}`,
    async () => {
      const contents = await fetch(url).then(x => x.text());
      const $ = cheerio.load(contents);
      const rootMatrix = new DOMMatrix(transform);

      const topNodes = Array.from($('svg > *'));
      const hull = extractGeoms($, topNodes, rootMatrix, 'hull');
      const doors = extractGeoms($, topNodes, rootMatrix, 'doors');
      const walls = extractGeoms($, topNodes, rootMatrix, 'walls');
      const obstacles = extractGeoms($, topNodes, rootMatrix, 'obstacles');
      const irisValves = extractGeoms($, topNodes, rootMatrix, 'iris-valves');
      const background = topNodes.find(x => hasTitle($, x, 'background'));

      // console.log({
      //   hull,
      //   doors,
      //   walls,
      // });

      return {
        svgInnerText: topNodes.map(x => $.html(x)).join('\n'),
        hull: Poly.union(hull).find(Boolean), // Assume connected
        doors,
        irisValves,
        obstacles,
        walls,
      };
    },
  );
}

/**
 * TODO forward meta?
 * @param {CheerioAPI} api 
 * @param {Element[]} topNodes 
 * @param {DOMMatrix} rootMatrix 
 * @param {string} title 
 */
function extractGeoms(api, topNodes, rootMatrix, title) {
  const group = topNodes.find(x => hasTitle(api, x, title));
  return api(group).children('rect, path').toArray()
    .flatMap(x => extractGeom(x, rootMatrix))
}

/**
 * TODO forward meta?
 * @param {Element} param0 
 * @param {DOMMatrix} rootMatrix 
 * @returns {Poly[]}
 */
function extractGeom({ tagName, attribs: a }, rootMatrix) {
  const tm = new DOMMatrix(a.transform);
  if (tagName === 'rect') {
    const poly = Poly.fromRect(
      new Rect(Number(a.x), Number(a.y), Number(a.width), Number(a.height)
    ).applyMatrix(rootMatrix.multiply(tm)));
    return [poly];
  } else if (tagName === 'path') {
    const polys = svgPathToPolygons(a.d);
    const m = rootMatrix.multiply(tm);
    return polys.map(p => p.applyMatrix(m));
  } else {
    console.warn('extractPoly: unexpected tagName:', tagName);
    return [];
  }
}

/**
 * - Test if node has child <title>{title}</title>,
 * - Additionally add class {title} if so.
 * @param {CheerioAPI} api 
 * @param {Element} node 
 * @param {string} title 
 */
 function hasTitle(api, node, title) {
  return api(node).children('title').text() === title && api(node).addClass(title)
}