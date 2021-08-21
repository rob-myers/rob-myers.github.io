import { useQuery } from "react-query";
import cheerio, { CheerioAPI, Element } from 'cheerio';

/** @param {{ url: string }} props */
export default function UseSvg(props) {
  const { data } = useSvgText(props.url);

  return (
    <g dangerouslySetInnerHTML={{
      __html: data?.svgInnerText || '',
    }}/>
  );
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

      console.log({
        background,
        hull,
        doors,
        topNodes,
      });
      
      return {
        svgInnerText: topNodes.map(x => $.html(x)).join('\n'),
        // TODO compute metadata
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
