import * as React from 'react';
import { css } from 'goober';
import PanZoom from '../panzoom/PanZoom';
import { Rect } from '../geom';
import UseSvg from './UseSvg';

const initViewBox = new Rect(0, 0, 200, 200);
const gridBounds = new Rect(-5000, -5000, 10000 + 1, 10000 + 1);

export default function GeomorphTest() {
  /** @type {React.RefObject<HTMLDivElement>} */
  const rootRef = React.useRef(null);
  return (
    <div className={rootCss} ref={rootRef}>
      <PanZoom initViewBox={initViewBox} gridBounds={gridBounds}>
        <g className="symbols">
          <UseSvg url="/svg/hull--301.svg" />
          {/* <use href="/svg/hull--301.svg#root" /> */}
        </g>
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
