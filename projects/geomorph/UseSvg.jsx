import { useQuery } from 'react-query';
import cheerio, { CheerioAPI, Element } from 'cheerio';
import classNames from 'classnames';
import { svgPathToPolygons } from '../service';
import { Poly, Rect, Vect } from '../geom';

/** @param {Props} props */
export default function UseSvg(props) {
  const { data } = useSvgText(props.url, props.tags);

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
        {data.labels.map(({ outline, meta }, i) =>
          // TODO render label meta.title
          <polygon key={i} className={classNames("label", meta?.title)} points={`${outline}`} />
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
 * @property {string[]} [tags]
 */

/**
 * @param {string} url
 * @param {string[]} [tags]
 */
function useSvgText(url, tags) {
  return useQuery(
    `use-svg-${url}-${tags || []}`,
    async () => {
      console.info('loading symbol', url);
      const contents = await fetch(url).then(x => x.text());
      const $ = cheerio.load(contents);

      const topNodes = Array.from($('svg > *'));
      const hull = extractGeoms($, topNodes, 'hull');
      const doors = extractGeoms($, topNodes, 'doors', tags);
      const walls = extractGeoms($, topNodes, 'walls');
      const obstacles = extractGeoms($, topNodes, 'obstacles');
      const irisValves = extractGeoms($, topNodes, 'iris-valves');
      const labels = extractGeoms($, topNodes, 'labels');
      const pngOffset = extractPngOffset($, topNodes);
      // console.log({ url, walls });

      return {
        basename: url.slice('/svg/'.length, -'.svg'.length),
        svgInnerText: topNodes.map(x => $.html(x)).join('\n'),
        hull: Poly.union(hull), // Assume connected, if exists
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
 * @param {string} title
 * @param {string[]} [tags]
 */
function extractGeoms(api, topNodes, title, tags) {
  const group = topNodes.find(x => hasTitle(api, x, title));
  return api(group).children('rect, path').toArray()
    .flatMap(x => extractGeom(api, x))
    .filter(x => {
      console.log(x.meta.title, tags)
      return matchesTag(x.meta.title, tags)
    });
}

/**
 * @param {CheerioAPI} api
 * @param {Element} el
 * @returns {Poly[]}
 */
function extractGeom(api, el) {
  const { tagName, attribs: a } = el;
  const polys = /** @type {Poly[]} */ ([]);
  const title = api(el).children('title').text() || undefined;

  if (tagName === 'rect') {
    const poly = Poly.fromRect(new Rect(Number(a.x || 0), Number(a.y || 0), Number(a.width || 0), Number(a.height || 0)));
    polys.push(poly.addMeta({ title }));
  } else if (tagName === 'path') {
    const polys = svgPathToPolygons(a.d);
    polys.push(...polys.map(x => x.addMeta({ title })));
  } else {
    console.warn('extractPoly: unexpected tagName:', tagName);
  }
  const m = new DOMMatrix(a.transform);
  return polys.map(p => p.applyMatrix(m));
}

/**
 * @param {CheerioAPI} api 
 * @param {Element[]} topNodes 
 */
 function extractPngOffset(api, topNodes) {
  const group = topNodes.find(x => hasTitle(api, x, 'background'));
  const { attribs: a } = api(group).children('image').toArray()[0];
  return new Vect(Number(a.x || 0), Number(a.y || 0));
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

/**
 * @param {string | undefined} title
 * @param {string[] | undefined} tags
 */
function matchesTag(title, tags) {
  return !tags || !title || (
    title.startsWith('has-') && tags.includes(title.slice(4))
  );
}