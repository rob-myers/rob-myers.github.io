import * as React from 'react';
import { css } from '@emotion/react';
import PanZoom from '../panzoom/PanZoom';
import { Rect } from '../geom';

const initViewBox = new Rect(0, 0, 200, 200);
const gridBounds = new Rect(-5000, -5000, 10000 + 1, 10000 + 1);

export default function GeomorphTest() {
  return (
    <div css={rootCss}>
      <PanZoom initViewBox={initViewBox} gridBounds={gridBounds}>
        <use href="/svg/hull--301.svg#root" />
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
