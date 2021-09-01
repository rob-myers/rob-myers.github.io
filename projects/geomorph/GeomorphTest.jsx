import * as React from 'react';
import { css } from 'goober';
import { Rect } from '../geom';
import PanZoom from '../panzoom/PanZoom';
import UseSvg from './UseSvg';

export default function GeomorphTest() {
  return (
    <div className={rootCss}>
      <PanZoom initViewBox={initViewBox} gridBounds={gridBounds}>
        <UseSvg url="/svg/301--hull.svg" />
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
  }
`;
