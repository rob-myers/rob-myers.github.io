import * as React from 'react';
import styled from '@emotion/styled';
import PanZoom from './PanZoom';
import { Rect } from '../geom';

const initViewBox = new Rect(0, 0, 200, 200);
const gridBounds = new Rect(-5000, -5000, 10000 + 1, 10000 + 1);

/** @param {{ className?: string }} props */
export default function PanZoomDemo({ className }) {
  return (
    <DemoRoot className={className}>
      <div className="title">
        drag to <strong>pan</strong>, scroll/pinch to <strong>zoom</strong>
      </div>
      <PanZoom initViewBox={initViewBox} gridBounds={gridBounds}>
        <rect fill="red" x={10} y={10} width={20} height={20} />
      </PanZoom>
    </DemoRoot>
  );
}

export const DemoRoot = styled('div')`
  display: flex;
  flex-direction: column;
  height: 100%;
  .title { padding: 12px 8px; }
  > svg { flex: 1; border: 1px solid #aaa; position: relative; }
`;
DemoRoot.displayName = 'PanZoomDemo';
