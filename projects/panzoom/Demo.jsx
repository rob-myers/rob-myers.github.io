import * as React from 'react';
import { styled } from 'goober';
import PanZoom from './PanZoom';

/** @param {{ className?: string }} props */
export default function PanZoomDemo({ className }) {
  return (
    <Container className={className}>
      <Title>
        drag to <strong>pan</strong>, scroll/pinch to <strong>zoom</strong>
      </Title>
      <Outline>
        <PanZoom>
          <rect fill="red" x={10} y={10} width={20} height={20} />
        </PanZoom>
      </Outline>
    </Container>
  );
}

const Container = styled('div')`
  display: flex;
  flex-direction: column;
  height: 100%;
`;
Container.displayName = 'Container';

const Title = styled('div')`
  padding: 8px;
`;

const Outline = styled('section')`
  flex: 1;
  border: 1px solid #aaa;
  position: relative;
`;
