import styled from '@emotion/styled';
import PanZoom from './PanZoom';

export default function Demo() {
  return (
    <>
      <Title>
        Drag to pan, Scroll or Pinch to Zoom
      </Title>
      <Outline>
        <PanZoom >
          <rect fill="red" x={10} y={10} width={20} height={20} />
        </PanZoom>
      </Outline>
    </>
  )
}

const Title = styled.div`
  padding: 8px;
`;

const Outline = styled.section`
  border: 1px solid #aaa;
`