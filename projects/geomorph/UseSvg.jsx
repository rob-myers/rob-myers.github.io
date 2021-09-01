import { useQuery } from 'react-query';
import cheerio, { CheerioAPI, Element } from 'cheerio';
import { svgPathToPolygons } from '../service';
import { Poly, Rect, Vect } from '../geom';

/** @param {Props} props */
export default function UseSvg(props) {
  const { data } = useSvgText(props.url);

  return data ? (
    <g
      className={`symbol ${data.basename}`}
      transform={props.transform}
    >
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
          x={data.pngOffset.x}
          y={data.pngOffset.y}
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
        {data.labels.map(({ outline }, i) =>
          // TODO forward label via polygon.meta
          <polygon key={i} className="label" points={`${outline}`} />
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
 */
function useSvgText(url) {
  return useQuery(
    `use-svg-${url}`,
    async () => {
      console.info('loading symbol', url);
      const contents = await fetch(url).then(x => x.text());
      const $ = cheerio.load(contents);

      const topNodes = Array.from($('svg > *'));
      const hull = extractGeoms($, topNodes, 'hull');
      const doors = extractGeoms($, topNodes, 'doors');
      const walls = extractGeoms($, topNodes, 'walls');
      const obstacles = extractGeoms($, topNodes, 'obstacles');
      const irisValves = extractGeoms($, topNodes, 'iris-valves');
      const labels = extractGeoms($, topNodes, 'labels');
      const pngOffset = extractPngOffset($, topNodes);
      // console.log({ url, walls });

      return {
        basename: url.slice('/svg/'.length, -'.svg'.length),
        svgInnerText: topNodes.map(x => $.html(x)).join('\n'),
        hull: Poly.union(hull), // Assume connected if exists
        doors,
        irisValves,
        labels,
        obstacles,
        pngOffset,
        walls,
      };
    },
  );
}

/**
 * @param {CheerioAPI} api 
 * @param {Element[]} topNodes 
 */
function extractPngOffset(api, topNodes) {
  const group = topNodes.find(x => hasTitle(api, x, 'background'));
  const { attribs: a } = api(group).children('image').toArray()[0];
  return (new Vect(Number(a.x || 0), Number(a.y || 0)));
}

/**
 * TODO forward meta
 * @param {CheerioAPI} api
 * @param {Element[]} topNodes
 * @param {string} title
 */
function extractGeoms(api, topNodes, title) {
  const group = topNodes.find(x => hasTitle(api, x, title));
  return api(group).children('rect, path').toArray()
    .flatMap(x => extractGeom(x))
}

/**
 * TODO forward meta
 * @param {Element} param0
 * @returns {Poly[]}
 */
function extractGeom({ tagName, attribs: a }) {
  const polys = /** @type {Poly[]} */ ([]);
  if (tagName === 'rect') {
    polys.push(Poly.fromRect(
      new Rect(Number(a.x || 0), Number(a.y || 0), Number(a.width || 0), Number(a.height || 0)
    )));
  } else if (tagName === 'path') {
    polys.push(...svgPathToPolygons(a.d));
  } else {
    console.warn('extractPoly: unexpected tagName:', tagName);
  }
  const m = new DOMMatrix(a.transform);
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