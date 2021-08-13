import * as React from 'react';
import styled from '@emotion/styled';
import PanZoom from './PanZoom';

/** @param {{ className?: string }} props */
export default function PanZoomDemo({ className }) {
  return (
    <DemoRoot className={className}>
      <div>
        drag to <strong>pan</strong>, scroll/pinch to <strong>zoom</strong>
      </div>
      <div>
        <PanZoom>
          <rect fill="red" x={10} y={10} width={20} height={20} />
        </PanZoom>
      </div>
    </DemoRoot>
  );
}

export const DemoRoot = styled('section')`
  display: flex;
  flex-direction: column;
  height: 100%;
  div:nth-of-type(1) { padding: 12px 8px; }
  div:nth-of-type(2) { flex: 1; border: 1px solid #aaa; position: relative; }
`;
DemoRoot.displayName = 'DemoRoot';
