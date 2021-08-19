import * as React from 'react';
import styled from '@emotion/styled';
import PanZoom from '../panzoom/PanZoom';
import { Rect } from '../geom';

const initViewBox = new Rect(0, 0, 200, 200);
const gridBounds = new Rect(-5000, -5000, 10000 + 1, 10000 + 1);

/** @param {{ className?: string }} props */
export default function GeomorphTest({ className }) {
  return (
    <Root className={className}>
      <PanZoom initViewBox={initViewBox} gridBounds={gridBounds}>
        <use href="/svg/hull--301.svg#root" />
      </PanZoom>
    </Root>
  );
}

const Root = styled('section')`
  border: 1px solid #555;
  width: 100%;
  height: 400px;
  position: relative;
`;
