import { useQuery } from 'react-query';
import cheerio, { CheerioAPI, Element } from 'cheerio';
import { svgPathToPolygons } from '../service';
import { Poly, Rect, Vect } from '../geom';

/** @param {Props} props */
export default function UseSvg(props) {
  const { data } = useSvgText(props.url, props.transform);

  return data ? (
    <g className={`symbol ${data.basename}`}>
      {props.debug && (
        <g
          className="debug"
          transform={props.transform}
          dangerouslySetInnerHTML={{
            __html: data.svgInnerText || '',
          }}
        />
      )}
      {!props.hull && (
        <image
          href={`/png/${data.basename}.png`}
          style={{ transform: `matrix(0.2, 0, 0, 0.2, ${data.pngOffset})`}}
        />
      )}
      <g className="meta">
        {data.hull[0] && (
          <polygon className="outline" points={`${data.hull[0].outline}`} />
        )}
        {data.hull.map((poly, i) =>
          <path key={i} className="hull" d={`${poly.svgPath}`} />
        )}
        {data.doors.map(({ outline }, i) =>
          <polygon key={i} className="door" points={`${outline}`} />
        )}
        {data.irisValves.map(({ outline }, i) =>
          <polygon key={i} className="iris-valve" points={`${outline}`} />
        )}
        {data.walls.map((poly, i) =>
          <path key={i} className="wall" d={`${poly.svgPath}`} />
        )}
        {data.obstacles.map((poly, i) =>
          <path key={i} className="obstacle" d={`${poly.svgPath}`} />
        )}
      </g>
    </g>
  ) : null;
}

/**
 * @typedef Props @type {object}
 * @property {string} url
 * @property {string} [transform]
 * @property {boolean} [hull]
 * @property {boolean} [debug]
 */

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
      const pngOffset = extractPngOffset($, topNodes, rootMatrix);

      // console.log({
        // pngOffset,
        // hull,
        // doors,
        // walls,
      // });

      return {
        basename: url.slice('/svg/'.length, -'.svg'.length),
        svgInnerText: topNodes.map(x => $.html(x)).join('\n'),
        hull: Poly.union(hull), // Assume connected
        doors,
        irisValves,
        obstacles: Poly.union(obstacles),
        pngOffset,
        walls,
      };
    },
  );
}

/**
 * @param {CheerioAPI} api 
 * @param {Element[]} topNodes 
 * @param {DOMMatrix} rootMatrix 
 */
function extractPngOffset(api, topNodes, rootMatrix) {
  const group = topNodes.find(x => hasTitle(api, x, 'background'));
  const { attribs: a } = api(group).children('image').toArray()[0];
  return (new Vect(Number(a.x || 0), Number(a.y || 0))).transform(rootMatrix);
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
  const polys = /** @type {Poly[]} */ ([]);
  if (tagName === 'rect') {
    polys.push(Poly.fromRect(
      new Rect(Number(a.x), Number(a.y), Number(a.width), Number(a.height)
    )));
  } else if (tagName === 'path') {
    polys.push(...svgPathToPolygons(a.d));
  } else {
    console.warn('extractPoly: unexpected tagName:', tagName);
  }
  const m = rootMatrix.multiply(new DOMMatrix(a.transform));
  return polys.map(p => p.applyMatrix(m));
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