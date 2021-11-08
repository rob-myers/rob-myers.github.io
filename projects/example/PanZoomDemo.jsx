import * as React from 'react';
import { css } from 'goober';
import PanZoom from '../panzoom/PanZoom';
import { Rect } from '../geom';
import { gridBounds, initViewBox } from './defaults';

export default function PanZoomDemo() {
  return (
    <div className={rootCss}>
      <p>
        drag to <strong>pan</strong>, scroll/pinch to <strong>zoom</strong>
      </p>
      <PanZoom
        initViewBox={biggerInitViewBox}
        gridBounds={gridBounds}
        maxZoom={5}
      >
        <image
          href="/geomorph/g-301--bridge.debug.png"
          x={pngRect.x * 2}
          y={pngRect.y * 2}
          style={{ transform: "scale(0.5)" }}
        />
        {/* <rect fill="red" x={0} y={0} width={20} height={20} /> */}
      </PanZoom>
    </div>
  );
}

const pngRect = new Rect(-6, -22, 1212, 628);
const biggerInitViewBox = initViewBox.clone().outset(50);

const rootCss = css`
  display: flex;
  flex-direction: column;
  height: 100%;

  > p {
    padding: 12px 8px;
    margin: 0;
    font-family: monospace;
    font-size: 16px;
    background: var(--focus-bg);
  }
`;