import React, { useEffect, useMemo, useState } from 'react';
import ReactFlow, {
  addEdge,
  updateEdge,
  Connection,
  Edge,
  Elements,
  removeElements,
  OnLoadParams,
  Controls,
  Position,
  useZoomPanHelper,
  useStoreState,
} from 'react-flow-renderer';

import { deepClone } from 'model/generic.model';
import styled from '@emotion/styled';
import CustomNode from './CustomNode';
import ConnectionLine from './ConnectionLine';

export default function ReactFlowExample() {
  const [elements, setElements] = useState<Elements>(deepClone(initElements));
  const edges = useStoreState(x => x.edges);
  const helper = useZoomPanHelper();

  const on = useMemo(() => ({
    elementsRemove: (elsToRemove: Elements) =>
      setElements((els) => els.length > 1 ? removeElements(elsToRemove, els) : els),
    edgeUpdate: (oldEdge: Edge, newConn: Connection) => {
      setElements((els) => {
        // TODO ensure graph is a forest
        const preexisting = edges.find(x =>
          x.source === newConn.source && x.sourceHandle === newConn.sourceHandle
          && x.target === newConn.target && x.targetHandle === newConn.targetHandle
        );
        if (preexisting) {
          if (preexisting === oldEdge) return els;
          els = removeElements([preexisting], els); // Prevent dup
        }
        return updateEdge(oldEdge, newConn, els);
      });
    },
    connect: (params: Edge | Connection) => {
      setElements((els) => addEdge({ ...params, type: 'smoothstep' }, els));
    },
    load: (params: OnLoadParams) => { },
    // addNode: () => {
    //   const newNode: Elements[0] = {
    //     id: `node_${id++}`,
    //     type,
    //     position,
    //     data: { label: `${type} node` },
    //   };
    //   setElements((es) => es.concat(newNode));
    // },
  }), [edges]);

  useEffect(() => {
    const onResize = () => helper.fitView();
    window.addEventListener('resize', onResize);
    setTimeout(onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [helper]);

  return (
    <>
      <Toolbar>
        <div>toolbar</div>
      </Toolbar>
      <section style={{ height: 'calc(100% - 28px)' }}>
        <ReactFlow
          elements={elements}
          onConnect={on.connect}
          onElementsRemove={on.elementsRemove}
          onEdgeUpdate={on.edgeUpdate}
          zoomOnPinch
          panOnScroll
          onLoad={on.load}
          snapToGrid
          // edgeTypes={{ custom: CustomEdge }}
          nodeTypes={{ custom: CustomNode }}
          connectionLineComponent={ConnectionLine}
        >
            <Controls />
        </ReactFlow>
      </section>
    </>
  );
}

const Toolbar = styled.section`
  display: flex;
  justify-content: space-between;
  align-items: center;
  user-select: none;
  font-size: 10pt;
  height: 28px;
  min-height: 28px;
  padding: 0 12px 0 8px;
  background-color: #333;
  color: #ddd;
`;

const initElements: Elements = [
  { id: '1', type: 'custom', data: { label: 'custom', srcs: ['a', 'b', 'c'] }, position: { x: 250, y: 5 } },
  { id: '2', type: 'custom', data: { label: '1', dsts: ['a'] }, position: { x: 100, y: 100 }, style: { width: 30 } },
  { id: '3', type: 'custom', data: { label: '2', dsts: ['a'] }, position: { x: 200, y: 100 }, sourcePosition: Position.Right },
  { id: '4', type: 'custom', data: { label: '3', dsts: ['a'] }, position: { x: 400, y: 100 } },
  { id: 'e1-2', source: '1', sourceHandle: 'a', target: '2', targetHandle: 'a', type: 'smoothstep' },
  { id: 'e1-3', source: '1', sourceHandle: 'b', target: '3', targetHandle: 'a', type: 'smoothstep' },
  { id: 'e1-4', source: '1', sourceHandle: 'c', target: '4', targetHandle: 'a', type: 'smoothstep' },
];
