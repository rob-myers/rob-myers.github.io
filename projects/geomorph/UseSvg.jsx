import { useQuery } from 'react-query';
import cheerio, { CheerioAPI, Element } from 'cheerio';
import { svgPathToPolygons } from '../service';
import { Poly } from '../geom';

/** @param {{ url: string, transform?: string }} props */
export default function UseSvg(props) {
  const { data } = useSvgText(props.url);

  return <>
    <g
      transform={props.transform}
      dangerouslySetInnerHTML={{
        __html: data?.svgInnerText || '',
      }}
    />
    <polygon fill="rgba(100, 0, 0, 0.2)" points={data?.hullOutline.outline.join(' ')} />
  </>;
}

/** @param {string} url */
function useSvgText(url) {
  return useQuery(
    `use-svg-${url}`,
    async () => {
      const contents = await fetch(url).then(x => x.text());
      const $ = cheerio.load(contents);
      const topNodes = Array.from($('svg > *'));
      const background = topNodes.find(x => hasTitle($, x, 'background'));
      const hull = topNodes.find(x => hasTitle($, x, 'hull'));
      const doors = topNodes.find(x => hasTitle($, x, 'doors'));

      const hullPolys = $(hull).children('path').toArray().map(({ attribs }) => {
        const poly = svgPathToPolygons(attribs.d);
        if (attribs.transform) {
          const m = new DOMMatrix(attribs.transform);
          poly.forEach(p => p.applyMatrix(m));
        }
        return poly;
      });

      /** Assume first polygon is outer one */
      const hullOutlines = hullPolys.map(x => x[0]);
      /** Assume hull is connected */
      const hullOutline = Poly.union(hullOutlines)[0];

      console.log({
        hullPolys,
        background,
        hull,
        doors,
        topNodes,
      });

      return {
        svgInnerText: topNodes.map(x => $.html(x)).join('\n'),
        hullOutline,
      };
    },
  );
}

/**
 * @param {CheerioAPI} api 
 * @param {Element} node 
 * @param {string} title 
 */
function hasTitle(api, node, title) {
  return api(node).children('title').text() === title;
}
