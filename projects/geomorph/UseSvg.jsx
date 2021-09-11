import { useQuery } from 'react-query';
import classNames from 'classnames';
import { parseStarshipSymbol, restrictByTags } from './parse-symbol';

/** @param {Props} props */
export default function UseSvg(props) {
  const { data } = useSvgText(props.symbol, props.tags, props.debug);

  return data ? (
    <g
      className={`symbol ${props.symbol}`}
      transform={props.transform}
      style={{ pointerEvents: 'none' }}
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
          href={`/symbol/${props.symbol}.png`}
          x={data.pngRect.x}
          y={data.pngRect.y}
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
 * @property {string} symbol
 * @property {string} [transform]
 * @property {boolean} [hull]
 * @property {boolean} [debug]
 * @property {string[]} [tags]
 */

/**
 * @param {string} symbolName
 * @param {string[]} [tags]
 * @param {boolean} [debug]
 */
function useSvgText(symbolName, tags, debug) {
  return useQuery(
    `use-svg-${symbolName}-${tags || '*'}}`,
    async () => {
      console.info('loading symbol', symbolName, tags || '*');
      const contents = await fetch(`/symbol/${symbolName}.svg`).then(x => x.text());
      const parsed = parseStarshipSymbol(symbolName, contents, debug);
      parsed.doors = restrictByTags(parsed.doors, tags);
      // console.log({ symbolName, parsed });
      return parsed;
    },
  );
}
