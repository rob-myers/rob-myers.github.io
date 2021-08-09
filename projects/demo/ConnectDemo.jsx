import * as React from 'react';
import { styled } from 'goober';

/** @param {{ className?: string }} props */
export default function ConnectPolyDemo({ className }) {
  return (
    <DemoRoot className={className}>
      <div>
        click squares to <strong>connect</strong> or <strong>disconnect</strong>
      </div>
      <div>
        {/* TODO */}
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
