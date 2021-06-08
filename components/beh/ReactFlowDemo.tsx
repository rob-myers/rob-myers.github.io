import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, {
  addEdge,
  Connection,
  Edge,
  Elements,
  removeElements,
  OnLoadParams as ReactFlowInstance,
  Controls,
  Position,
  useStoreActions,
  isEdge,
} from 'react-flow-renderer';

import styled from '@emotion/styled';
import CustomNode from './CustomNode';
import ConnectionLine from './ConnectionLine';

export interface CustomNodeApi {
  onHandleClick: (nodeId: string, handleId: string) => void;
}

export default function ReactFlowExample() {
  const instance = useRef<ReactFlowInstance>();
  const nodeApi = useRef<CustomNodeApi>({
    onHandleClick: () => {},
  }).current;
  const [elements, setElements] = useState<Elements>(createElements(nodeApi));
  const addSelectedElements = useStoreActions(act => act.addSelectedElements);

  useEffect(() => {
    const edges = elements.filter(isEdge);
    nodeApi.onHandleClick = (nodeId: string, handleId: string) => {
      // Select edges connected to node's handle
      addSelectedElements(edges.filter(x =>
        (x.source === nodeId && x.sourceHandle === handleId)
        || (x.target === nodeId && x.targetHandle === handleId)
      ));
    };
  }, [elements]);

  useEffect(() => void setTimeout(() => instance.current?.fitView()), []);

  const on = useMemo(() => ({
    elementsRemove: (elsToRemove: Elements) =>
      setElements((els) => els.length > 1 ? removeElements(elsToRemove, els) : els),
    connect: (params: Edge | Connection) => {
      setElements((els) => addEdge({ ...params, type: 'smoothstep' }, els));
    },
    load: (input: ReactFlowInstance) =>
      instance.current = input,
  }), []);

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
          // onEdgeUpdate={on.edgeUpdate}
          zoomOnScroll={false}
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

// Source/target handles start with s/t
function createElements(nodeApi: CustomNodeApi) {
  const initElements: Elements = [
    { id: '1', type: 'custom', data: { label: 'custom', srcs: ['sa', 'sb', 'sc'] }, position: { x: 250, y: 5 } },
    { id: '2', type: 'custom', data: { label: '1', dsts: ['ta'] }, position: { x: 100, y: 100 }, style: { width: 30 } },
    { id: '3', type: 'custom', data: { label: '2', dsts: ['ta'] }, position: { x: 200, y: 100 }, sourcePosition: Position.Right },
    { id: '4', type: 'custom', data: { label: '3', dsts: ['ta'] }, position: { x: 400, y: 100 } },
    { id: 'e1-2', source: '1', sourceHandle: 'sa', target: '2', targetHandle: 'ta', type: 'smoothstep' },
    { id: 'e1-3', source: '1', sourceHandle: 'sb', target: '3', targetHandle: 'ta', type: 'smoothstep' },
    { id: 'e1-4', source: '1', sourceHandle: 'sc', target: '4', targetHandle: 'ta', type: 'smoothstep' },
  ];
  initElements.slice(0, 4).forEach(x => x.data.nodeApi = nodeApi);
  return initElements;
}
