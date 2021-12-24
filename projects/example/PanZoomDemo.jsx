import * as React from 'react';
import { css } from 'goober';
import PanZoom from '../panzoom/PanZoom';
import { Rect } from '../geom';
import * as defaults from './defaults';

export default function PanZoomDemo() {
  return (
    <div className={rootCss}>
      <p>
        drag to <strong>pan</strong>, scroll/pinch to <strong>zoom</strong>
      </p>
      <PanZoom
        initViewBox={defaults.initViewBox}
        gridBounds={defaults.gridBounds}
        maxZoom={5}
      >
        <image
          href="/geomorph/g-301--bridge.debug.png"
          {...pngRect}
        />
      </PanZoom>
    </div>
  );
}

const pngRect = (new Rect(-6, -22, 1212, 628)).json;

const rootCss = css`
  display: flex;
  flex-direction: column;
  height: 100%;

  > p {
    padding: 12px 20px;
    margin: 0;
    font-family: monospace;
    font-size: 14px;
    background: black;
    color: white;
  }
`;