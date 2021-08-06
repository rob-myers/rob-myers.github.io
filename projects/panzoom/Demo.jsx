import { styled } from 'goober';
import PanZoom from './PanZoom';

export default function Demo() {
  return (
    <Container>
      <Title>
        Drag to pan, Scroll or Pinch to Zoom
      </Title>
      <Outline>
        <PanZoom >
          <rect fill="red" x={10} y={10} width={20} height={20} />
        </PanZoom>
      </Outline>
    </Container>
  )
}

const Container = styled('div')`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const Title = styled('div')`
  padding: 8px;
`;

const Outline = styled('section')`
  flex: 1;
  border: 1px solid #aaa;
  position: relative;
`;
