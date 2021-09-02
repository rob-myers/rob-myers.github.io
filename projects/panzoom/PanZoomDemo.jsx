import * as React from 'react';
import { css } from 'goober';
import PanZoom from './PanZoom';
import { Rect } from '../geom';

export default function PanZoomDemo() {
  return (
    <div className={rootCss}>
      <p>
        drag to <strong>pan</strong>, scroll/pinch to <strong>zoom</strong>
      </p>
      <PanZoom initViewBox={initViewBox} gridBounds={gridBounds}>
        <rect fill="red" x={10} y={10} width={20} height={20} />
      </PanZoom>
    </div>
  );
}

const gridBounds = new Rect(-5000, -5000, 10000 + 1, 10000 + 1);
const initViewBox = new Rect(0, 0, 200, 200);

const rootCss = css`
  display: flex;
  flex-direction: column;
  height: 100%;

  > p {
    padding: 12px 8px;
    margin: 0;
    font-family: monospace;
    font-size: 16px;
    background: #eee;
  }
`;