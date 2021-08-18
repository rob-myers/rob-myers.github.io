import * as React from 'react';
import styled from '@emotion/styled';
import PanZoom from '../panzoom/PanZoom';

/** @param {{ className?: string }} props */
export default function GeomorphTest({ className }) {
  return (
    <Root>
      <PanZoom className={className}>
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
