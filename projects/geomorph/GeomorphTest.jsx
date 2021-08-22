import * as React from 'react';
import { css } from 'goober';
import { Rect } from '../geom';
import PanZoom from '../panzoom/PanZoom';
import UseSvg from './UseSvg';

const initViewBox = new Rect(0, 0, 1200, 600);
const gridBounds = new Rect(-5000, -5000, 10000 + 1, 10000 + 1);

export default function GeomorphTest() {
  /** @type {React.RefObject<HTMLDivElement>} */
  const rootRef = React.useRef(null);
  return (
    <div className={rootCss} ref={rootRef}>
      <PanZoom initViewBox={initViewBox} gridBounds={gridBounds}>
        <UseSvg url="/svg/301--hull.svg" />
        <UseSvg url="/svg/bridge--042--8x9.svg" transform="matrix(0.2, 0, 0, 0.2, 360, 60) " />
        {/* <use href="/svg/hull--301.svg#root" /> */}
      </PanZoom>
    </div>
  );
}

const rootCss = css`
  border: 1px solid #555;
  width: 100%;
  height: 400px;
  position: relative;
`;
