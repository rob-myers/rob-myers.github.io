import React, { useEffect, useRef } from "react";
import styled from "@emotion/styled";
import { ReactFlowProvider } from 'react-flow-renderer';
import ReactFlowDemo from './ReactFlowDemo';

export default function BehTree() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current!;
    const preventWheel = (e: MouseEvent) => e.preventDefault();
    el.addEventListener('wheel', preventWheel, { passive: false } );
    return () => el.removeEventListener('wheel', preventWheel);
  }, []);

  return (
    <Root ref={root}>
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
