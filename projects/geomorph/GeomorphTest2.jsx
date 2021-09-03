import { css } from "goober";
import { useQuery } from "react-query";
import { Rect } from "../geom";
import PanZoom from '../panzoom/PanZoom';

export default function GeomorphTest2() {
  useQuery('foo', async () => null); // Rerenders on focus page

  return (
    <div className={rootCss}>
      <PanZoom initViewBox={initViewBox} gridBounds={gridBounds} maxZoom={5}>
        {/* <UseSvg hull debug={true} url="/svg/301--hull.svg" />
        <UseSvg url="/svg/misc-stellar-cartography--023--4x4.svg" transform="matrix(-0.2, 0, 0, 0.2, 1200, 360)" />
        <UseSvg url="/svg/stateroom--014--2x2.svg" transform="matrix(0.2, 0, 0, -0.2, 0, 480)" />
        <UseSvg url="/svg/stateroom--014--2x2.svg" transform="matrix(0.2, 0, 0, -0.2, 120, 480)" />
        <UseSvg url="/svg/office--001--2x2.svg" tags={['door-s']} transform="matrix(-0.2, 0, 0, 0.2, 240, 120)" />
        <UseSvg url="/svg/office--001--2x2.svg" tags={['door-s']} transform="matrix(0.2, 0, 0, 0.2, 960, 120)" />
        <UseSvg url="/svg/stateroom--036--2x4.svg" transform="scale(0.2)" />
        <UseSvg url="/svg/stateroom--036--2x4.svg" transform="matrix(-0.2, 0, 0, 0.2, 1200, 0)" />
        <UseSvg url="/svg/stateroom--036--2x4.svg" transform="matrix(0, -0.2, 0.2, 0, 0, 600)" />
        <UseSvg url="/svg/bridge--042--8x9.svg" transform="matrix(0.2, 0, 0, 0.2, 360, 60)" /> */}
      </PanZoom>
    </div>
  );
}

const initViewBox = new Rect(0, 0, 1200, 600);
const gridBounds = new Rect(-5000, -5000, 10000 + 1, 10000 + 1);

const rootCss = css``;

/** @type {LayoutItem[]} */
const layout = [
  { symbol: '301--hull', hull: true },
  { symbol: 'misc-stellar-cartography--023--4x4', transform: [-1, 0, 0, 1, 1200, 360] },
  { symbol: 'stateroom--014--2x2', transform: [1, 0, 0, -1, 0, 480] },
  { symbol: 'stateroom--014--2x2', transform: [1, 0, 0, -1, 120, 480] },
  { symbol: 'office--001--2x2', transform: [-1, 0, 0, 1, 240, 120], tags: ['door-s'] },
  { symbol: 'office--001--2x2', transform: [1, 0, 0, 1, 960, 120], tags: ['door-s'] },
  { symbol: 'stateroom--036--2x4' },
  { symbol: 'stateroom--036--2x4', transform: [-1, 0, 0, 1, 1200, 0] },
  { symbol: 'stateroom--036--2x4', transform: [0, -1, 1, 0, 0, 600] },
  { symbol: 'bridge--042--8x9', transform: [1, 0, 0, 1, 360, 60] },
];

/**
 * @typedef LayoutItem @type {object}
 * @property {string} symbol
 * @property {boolean} [hull]
 * @property {number[]} [transform]
 * @property {string[]} [tags]
 */