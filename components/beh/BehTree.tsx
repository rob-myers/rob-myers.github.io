import React, { useCallback } from "react";
import styled from "@emotion/styled";
import { ReactFlowProvider } from 'react-flow-renderer';
import ReactFlowDemo from './ReactFlowDemo';

export default function BehTree() {
  const preventWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
  }, []);

  return (
    <Root onWheel={preventWheel}>
      <ReactFlowProvider>
        <ReactFlowDemo/>
      </ReactFlowProvider>
    </Root>
  );
}

const Root = styled.section<{}>`
  grid-area: beh;
  height: 100%;
  position: relative;
  background: #eee;
`;
