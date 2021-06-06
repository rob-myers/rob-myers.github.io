import { useEffect, useMemo, useState } from 'react';
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
  Background,
  BackgroundVariant,
} from 'react-flow-renderer';

import { deepClone } from 'model/generic.model';
// import CustomEdge from './CustomEdge';
import styled from '@emotion/styled';
import CustomNode from './CustomNode';
import ConnectionLine from './ConnectionLine';

export default function ReactFlowExample() {
  const [elements, setElements] = useState<Elements>(deepClone(initElements));
  const helper = useZoomPanHelper();

  const on = useMemo(() => ({
    elementsRemove: (elsToRemove: Elements) =>
      setElements((els) => removeElements(elsToRemove, els)),
    edgeUpdate: (oldEdge: Edge, newConnection: Connection) =>
      setElements((els) => updateEdge(oldEdge, newConnection, els)),
    connect: (params: Edge | Connection) =>
      setElements((els) => addEdge({ ...params, type: 'smoothstep' }, els)),
    load: (params: OnLoadParams) => {},
  }), []);

  useEffect(() => {
    const onResize = () => helper.fitView();
    window.addEventListener('resize', onResize);
    setTimeout(onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [helper]);

  return (
    <>
      <Toolbar>
        toolbar
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
            <Background variant={BackgroundVariant.Lines} />
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
  {
    id: '1',
    type: 'custom',
    data: { label: 'root' },
    position: { x: 250, y: 5 },
  },
  { id: '2', data: { label: '1' }, position: { x: 100, y: 100 }, style: { width: 30 } },
  { id: '3', data: { label: '2' }, position: { x: 200, y: 100 }, sourcePosition: Position.Right },
  { id: '4', data: { label: '3' }, position: { x: 400, y: 100 } },
  { id: 'e1-2', source: '1', sourceHandle: 'a', target: '2', type: 'smoothstep' },
  { id: 'e1-3', source: '1', sourceHandle: 'b', target: '3', type: 'smoothstep' },
  { id: 'e1-4', source: '1', sourceHandle: 'c', target: '4', type: 'smoothstep' },
];
