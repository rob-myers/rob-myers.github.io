import { useQuery } from 'react-query';
import cheerio, { CheerioAPI, Element } from 'cheerio';
import { svgPathToPolygons } from '../service';
import { Poly, Rect } from '../geom';

/** @param {{ url: string, transform?: string }} props */
export default function UseSvg(props) {
  const { data } = useSvgText(props.url, props.transform);

  return <g className={`used ${props.url.slice('/svg/'.length)}`}>
    <g
      className="loaded"
      transform={props.transform}
      dangerouslySetInnerHTML={{
        __html: data?.svgInnerText || '',
      }}
    />
    <g className="meta">
      <polygon fill="rgba(100, 0, 0, 0.2)" points={data?.hullOutline?.outline.join(' ')} />
      {(data?.doorRects || []).map(({ x, y, width, height }, i) =>
        <rect fill="rgba(0, 0, 200, 0.3)" key={i} x={x} y={y} width={width} height={height} />
      )}
    </g>
  </g>;
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
      const background = topNodes.find(x => hasTitle($, x, 'background'));
      const hull = topNodes.find(x => hasTitle($, x, 'hull'));
      const doors = topNodes.find(x => hasTitle($, x, 'doors'));
      const walls = topNodes.find(x => hasTitle($, x, 'walls'));
      const obstacles = topNodes.find(x => hasTitle($, x, 'walls'));
      const irisValves = topNodes.find(x => hasTitle($, x, 'iris-valves'));

      // Assume 1st polygon is outer one
      const hullOutlines = $(hull).children('path').toArray().map(({ attribs }) => {
        const polys = svgPathToPolygons(attribs.d);
        const m = rootMatrix.multiply(new DOMMatrix(attribs.transform));
        return polys.map(p => p.applyMatrix(m));
      }).map(x => x[0]);
      
      const doorRects = $(doors).children('rect').toArray().map(({ attribs: a }) =>
        (new Rect(Number(a.x), Number(a.y), Number(a.width), Number(a.height)))
          .applyMatrix(rootMatrix.multiply(new DOMMatrix(a.transform)))
      );

      console.log({
        background,
        hull,
        doors,
        // topNodes,
        hullOutlines,
        doorRects,
      });

      return {
        svgInnerText: topNodes
          .map(x => $.html(x)).join('\n'),
        hullOutline: Poly.union(hullOutlines)[0], // Assume connected
        doorRects,
      };
    },
  );
}

/**
 * Test if node has child <title>{title}</title>,
 * additionally adding class {title} if so.
 * @param {CheerioAPI} api 
 * @param {Element} node 
 * @param {string} title 
 */
function hasTitle(api, node, title) {
  return api(node).children('title').text() === title && api(node).addClass(title)
}
