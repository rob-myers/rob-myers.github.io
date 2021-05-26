import { useRef } from "react";
import styled from "@emotion/styled";

export default function BehTree() {
  const containerRef = useRef<HTMLElement>(null);

  return (
    <Root ref={containerRef}>
    </Root>
  );
}

const Root = styled.section<{}>`
  grid-area: beh;
  border: 1px solid #ccc;
  height: 100%;
`;
