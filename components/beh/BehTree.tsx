import { useEffect, useRef } from "react";
import styled from "@emotion/styled";
import ReactFlowDemo from './ReactFlowDemo';

export default function BehTree() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    root.current?.addEventListener('wheel', (e) => {
      e.preventDefault();
    });
  }, []);

  return (
    <Root ref={root}>
      <ReactFlowDemo/>
    </Root>
  );
}

const Root = styled.section<{}>`
  grid-area: beh;
  height: 100%;
  position: relative;
  background: #eee;

  .diagram-container{
    width: 100%;
    height: 100%;
  }

  .custom-node {
    border: solid 1px gray;
    border-radius: 5px;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    position: relative;
    background: #ddd;
  }

  .custom-node-color {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 20px;
    height: 20px;
    transform: translate(-50%, -50%);
    border-radius: 10px;
  }

  .circle-port{
    width: 8px;
    height: 8px;
    margin: 2px;
    border-radius: 4px;
    background: darkgray;
    cursor: pointer;
  }

  .circle-port:hover{
    background: mediumpurple;
  }
`;
