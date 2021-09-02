import * as React from 'react';
import { css } from 'goober';
import { Rect } from '../geom';
import PanZoom from '../panzoom/PanZoom';
import UseSvg from './UseSvg';

export default function GeomorphTest() {
  return (
    <div className={rootCss}>
      <PanZoom initViewBox={initViewBox} gridBounds={gridBounds} maxZoom={5}>
        <UseSvg hull debug={true} url="/svg/301--hull.svg" />
        <UseSvg url="/svg/misc-stellar-cartography--023--4x4.svg" transform="matrix(-0.2, 0, 0, 0.2, 1200, 360)" />
        <UseSvg url="/svg/stateroom--014--2x2.svg" transform="matrix(0.2, 0, 0, -0.2, 0, 480)" />
        <UseSvg url="/svg/stateroom--014--2x2.svg" transform="matrix(0.2, 0, 0, -0.2, 120, 480)" />
        <UseSvg url="/svg/office--001--2x2.svg" tags={['door-s']} transform="matrix(-0.2, 0, 0, 0.2, 240, 120)" />
        <UseSvg url="/svg/office--001--2x2.svg" tags={['door-s']} transform="matrix(0.2, 0, 0, 0.2, 960, 120)" />
        <UseSvg url="/svg/stateroom--036--2x4.svg" transform="scale(0.2)" />
        <UseSvg url="/svg/stateroom--036--2x4.svg" transform="matrix(-0.2, 0, 0, 0.2, 1200, 0)" />
        <UseSvg url="/svg/stateroom--036--2x4.svg" transform="matrix(0, -0.2, 0.2, 0, 0, 600)" />
        <UseSvg url="/svg/bridge--042--8x9.svg" transform="matrix(0.2, 0, 0, 0.2, 360, 60)" />
      </PanZoom>
    </div>
  );
}

const initViewBox = new Rect(0, 0, 1200, 600);
const gridBounds = new Rect(-5000, -5000, 10000 + 1, 10000 + 1);

const rootCss = css`
  width: inherit;
  height: inherit;

  .meta {
    stroke: none;
    .outline { fill: rgba(0, 0, 100, 0.2); }
    .door, .iris-valve { fill: rgba(0, 200, 0, 0.3); }
    .wall, .hull { fill: rgba(200, 50, 50, 0.5); }
    .obstacle { fill: rgba(100, 100, 150, 0.5); }
    .label { fill: rgba(0, 0, 0, 0.4); }
  }
`;
